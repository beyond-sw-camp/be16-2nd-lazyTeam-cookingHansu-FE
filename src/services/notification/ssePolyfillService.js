import { useAuthStore } from '@/store/auth/auth';

/**
 * SSE Polyfill - JWT 토큰을 헤더에 포함한 EventSource 구현
 * 브라우저의 EventSource는 헤더를 보낼 수 없어서 XMLHttpRequest로 구현
 */
class EventSourcePolyfill {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options; // options 전체를 저장
    this.withCredentials = options.withCredentials || false;
    this.headers = options.headers || {};
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.readyState = 0; // CONNECTING
    
    this.xhr = null;
    this.isConnected = false;
    this.isClosed = false; // 연결 종료 상태 추적
    
    // 중복 처리 방지를 위한 처리된 데이터 추적
    this.processedData = new Set();
    this.processedDataMaxSize = 100; // 최대 100개까지만 추적하여 메모리 누수 방지
    
    // 연결 정리를 위한 타이머들
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.cleanupTimer = null;
    
    // 페이지 언로드 시 정리를 위한 플래그
    this.isPageUnloading = false;
    
    this.connect();
  }

  connect() {
    // 이미 연결되어 있거나 종료된 경우 중복 연결 방지
    if (this.isConnected || this.isClosed || this.isPageUnloading) {
      return;
    }
    
    try {
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', this.url, true);
      
      // 헤더 설정
      if (this.headers) {
        Object.keys(this.headers).forEach(key => {
          const value = this.headers[key];
          this.xhr.setRequestHeader(key, value);
        });
      }
      
      // withCredentials 설정
      if (this.withCredentials) {
        this.xhr.withCredentials = true;
      }
      
      // 이벤트 핸들러 설정
      this.xhr.onreadystatechange = (event) => {
        this.handleStateChange();
      };
      
      this.xhr.onerror = (event) => {
        this.handleError(new Error('Network error'));
      };
      
      this.xhr.send();
      
    } catch (error) {
      console.error('🔍 SSE Polyfill 연결 실패:', error);
      this.handleError(error);
    }
  }

  handleStateChange() {
    if (this.xhr.readyState === 4) {
      if (this.xhr.status === 200) {
        this.readyState = 1; // OPEN
        this.isConnected = true;
        
        if (this.onopen) {
          this.onopen({ type: 'open' });
        }
        
        // 응답 데이터 처리
        this._processResponse();
        
        // 하트비트 타이머 시작 (30초마다 연결 상태 확인)
        this.startHeartbeat();
      } else if (this.xhr.status === 401) {
        console.error('🔍 SSE 인증 실패 (401):', {
          status: this.xhr.status,
          statusText: this.xhr.statusText,
          responseText: this.xhr.responseText,
          headers: this.xhr.getAllResponseHeaders()
        });
        this.handleError(new Error('HTTP 401'));
      } else {
        console.error('🔍 SSE 연결 실패:', {
          status: this.xhr.status,
          statusText: this.xhr.statusText,
          responseText: this.xhr.responseText
        });
        this.handleError(new Error(`HTTP ${this.xhr.status}`));
      }
    } else if (this.xhr.readyState === 3) {
      // LOADING 상태 - 스트리밍 데이터 수신 중
      this._processResponse();
    }
  }

  /**
   * 응답 데이터 처리
   */
  _processResponse() {
    try {
      const responseText = this.xhr.responseText;
      if (!responseText) return;
      
      const lines = responseText.split('\n');
      
      // 이벤트와 데이터를 함께 처리
      let currentEvent = null;
      let currentData = null;
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('event:')) {
          currentEvent = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          currentData = line.substring(5).trim();
          if (currentData) {
            try {
              // JSON 데이터인지 확인
              if (currentData.startsWith('{') || currentData.startsWith('[')) {
                const jsonData = JSON.parse(currentData);
                
                // connect 이벤트 처리
                if (currentData === '"ok"') {
                  if (this.onopen) {
                    this.onopen({ type: 'open', data: 'ok' });
                  }
                }
                // notify 이벤트 처리 (서버에서 실제 사용하는 이벤트명)
                else if (currentEvent === 'notify' && (jsonData.recipientId || jsonData.content)) {
                  // 중복 처리 방지: 이미 처리된 알림인지 확인
                  const notificationKey = `${jsonData.targetId || jsonData.id}_${jsonData.content}`;
                  if (this.processedData.has(notificationKey)) {
                    continue;
                  }
                  
                  this.processedData.add(notificationKey);
                  
                  // 메모리 관리: 처리된 데이터 크기 제한
                  if (this.processedData.size > this.processedDataMaxSize) {
                    const firstKey = this.processedData.values().next().value;
                    this.processedData.delete(firstKey);
                  }
                  
                  if (this.onmessage) {
                    this.onmessage({ 
                      type: 'notify', 
                      data: JSON.stringify(jsonData) 
                    });
                  }
                }
              } else {
                // 일반 텍스트 데이터 (예: "ok")
                if (currentData === 'ok') {
                  if (this.onopen) {
                    this.onopen({ type: 'open', data: 'ok' });
                  }
                }
              }
            } catch (parseError) {
              console.warn('🔍 SSE 데이터 파싱 실패:', parseError, '원본 데이터:', currentData);
            }
          }
        }
      }
    } catch (error) {
      console.warn('🔍 SSE 데이터 처리 오류:', error);
    }
  }

  handleError(error) {
    console.error('🔍 SSE Polyfill 에러:', error);
    this.readyState = 2; // CLOSED
    this.isConnected = false;
    
    if (this.onerror) {
      this.onerror(error);
    }
    

  }


  close() {
    this.cleanup();
    
    // 중복 처리 방지 데이터 정리
    this.processedData.clear();
    
    // 이벤트 핸들러 정리
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
  }

  addEventListener(event, callback) {
    switch (event) {
      case 'open':
        this.onopen = callback;
        break;
      case 'message':
        this.onmessage = callback;
        break;
      case 'error':
        this.onerror = callback;
        break;
    }
  }

  removeEventListener(event, callback) {
  }

  // 하트비트 시작 (연결 상태 주기적 확인)
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isClosed || this.isPageUnloading) {
        this.stopHeartbeat();
        return;
      }
      
      // 연결 상태 확인
      if (this.xhr && this.xhr.readyState === 4) {
        // 연결이 끊어진 경우 재연결 시도
        if (!this.isConnected) {
          console.log('🔍 SSE 연결 끊어짐 감지, 재연결 시도...');
          this.reconnect();
        }
      }
    }, 30000); // 30초마다 확인
  }

  // 하트비트 중지
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 재연결 시도
  reconnect() {
    if (this.isClosed || this.isPageUnloading || this.reconnectTimer) {
      return;
    }
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isClosed && !this.isPageUnloading) {
        console.log('🔍 SSE 재연결 시도...');
        this.cleanup();
        this.connect();
      }
      this.reconnectTimer = null;
    }, 5000); // 5초 후 재연결 시도
  }

  // 완전한 연결 정리
  cleanup() {
    this.isConnected = false;
    this.isClosed = true;
    
    // 모든 타이머 정리
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // XHR 연결 정리
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
    
    // 메모리 정리
    if (this.processedData) {
      this.processedData.clear();
    }
  }

  // 페이지 언로드 시 정리
  prepareForUnload() {
    this.isPageUnloading = true;
    this.cleanup();
  }
}

// 전역 SSE 연결 관리
const activeConnections = new Set();

// 페이지 언로드 시 모든 SSE 연결 정리
window.addEventListener('beforeunload', () => {
  activeConnections.forEach(connection => {
    if (connection && typeof connection.prepareForUnload === 'function') {
      connection.prepareForUnload();
    }
  });
  activeConnections.clear();
});

// 페이지 숨김 시 연결 정리 (모바일에서 앱 전환 시)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 페이지가 숨겨진 경우 연결 상태만 확인
    activeConnections.forEach(connection => {
      if (connection && connection.isConnected) {
        // 연결은 유지하되 하트비트만 일시 중지
        connection.stopHeartbeat();
      }
    });
  } else {
    // 페이지가 다시 보이는 경우 하트비트 재시작
    activeConnections.forEach(connection => {
      if (connection && connection.isConnected) {
        connection.startHeartbeat();
      }
    });
  }
});

/**
 * SSE Polyfill 서비스
 */
export const ssePolyfillService = {
  /**
   * EventSource Polyfill 생성 (항상 Polyfill 사용)
   * @param {string} url - SSE 엔드포인트 URL
   * @param {Object} options - 옵션 (withCredentials, headers 등)
   * @returns {EventSourcePolyfill} - Polyfill EventSource 인스턴스
   */
  createEventSource(url, options = {}) {
    // JWT 토큰을 헤더에 포함해야 하므로 항상 Polyfill 사용
    const connection = new EventSourcePolyfill(url, options);
    activeConnections.add(connection);
    return connection;
  },

  /**
   * JWT 토큰을 포함한 SSE 연결 생성
   * @param {string} url - SSE 엔드포인트 URL
   * @returns {EventSourcePolyfill} - Polyfill EventSource 인스턴스
   */
  createAuthenticatedEventSource(url) {
    const authStore = useAuthStore();
    
    if (!authStore.accessToken) {
      console.error('🔍 SSE 연결 실패: 인증 토큰이 없습니다.');
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
    
    const options = {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Accept': 'text/event-stream'
      }
    };
    
    const connection = this.createEventSource(url, options);
    
    // 연결 종료 시 전역 관리에서 제거
    const originalClose = connection.close.bind(connection);
    connection.close = () => {
      activeConnections.delete(connection);
      originalClose();
    };
    
    return connection;
  }
};

export default ssePolyfillService;

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
    
    // 중복 처리 방지를 위한 처리된 데이터 추적
    this.processedData = new Set();
    
    this.connect();
  }

  connect() {
    try {
      console.log('🔍 SSE Polyfill 연결 시도:', {
        url: this.url,
        method: 'GET',
        headers: this.headers,
        withCredentials: this.withCredentials
      });
      
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', this.url, true);
      
      // 헤더 설정
      if (this.headers) {
        Object.keys(this.headers).forEach(key => {
          const value = this.headers[key];
          console.log(`🔍 헤더 설정: ${key} = ${value}`);
          this.xhr.setRequestHeader(key, value);
        });
      }
      
      // withCredentials 설정
      if (this.withCredentials) {
        this.xhr.withCredentials = true;
      }
      
      // 이벤트 핸들러 설정
      this.xhr.onreadystatechange = (event) => {
        console.log('🔍 onreadystatechange 이벤트 발생:', {
          readyState: this.xhr.readyState,
          status: this.xhr.status,
          statusText: this.xhr.statusText
        });
        this.handleStateChange();
      };
      
      this.xhr.onerror = (event) => {
        console.log('🔍 onerror 이벤트 발생:', event);
        this.handleError(new Error('Network error'));
      };
      
      // 백엔드에서 1시간 타임아웃을 설정하므로 프론트엔드 타임아웃은 제거
      // this.xhr.timeout = 300000; // 제거
      
      console.log('🔍 SSE Polyfill XMLHttpRequest 전송됨');
      this.xhr.send();
      
    } catch (error) {
      console.error('🔍 SSE Polyfill 연결 실패:', error);
      this.handleError(error);
    }
  }

  handleStateChange() {
    console.log('🔍 handleStateChange 호출됨:', {
      readyState: this.xhr.readyState,
      status: this.xhr.status,
      statusText: this.xhr.statusText,
      responseHeaders: this.xhr.getAllResponseHeaders()
    });
    
    if (this.xhr.readyState === 4) {
      console.log('🔍 SSE Polyfill 응답 상태:', {
        status: this.xhr.status,
        statusText: this.xhr.statusText,
        responseHeaders: this.xhr.getAllResponseHeaders(),
        readyState: this.xhr.readyState
      });
      
      if (this.xhr.status === 200) {
        this.readyState = 1; // OPEN
        this.isConnected = true;
        
        if (this.onopen) {
          this.onopen({ type: 'open' });
        }
        
        // 응답 데이터 처리
        this._processResponse();
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
      console.log('🔍 SSE 스트리밍 데이터 수신 중...');
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
                    console.log('🔍 중복 알림 감지, 건너뜀:', notificationKey);
                    continue;
                  }
                  
                  console.log('🔍 새 알림 처리:', notificationKey);
                  this.processedData.add(notificationKey);
                  
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
    
    // 재연결 시도
    // this.attemptReconnect(); // 재연결 로직 제거
  }

  // attemptReconnect() { // 재연결 로직 제거
  //   if (this.reconnectAttempts < this.maxReconnectAttempts) {
  //     this.reconnectAttempts++;
  //     console.log(`SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
  //     setTimeout(() => {
  //       if (!this.isConnected) {
  //         this.connect();
  //       }
  //     }, this.reconnectDelay * this.reconnectAttempts);
  //   } else {
  //     console.error('SSE 최대 재연결 시도 횟수 초과');
  //   }
  // }

  close() {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
    this.readyState = 2; // CLOSED
    this.isConnected = false;
    
    // 중복 처리 방지 데이터 정리
    this.processedData.clear();
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
}

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
    console.log('🔍 SSE Polyfill 강제 사용 (JWT 토큰 인증 필요)');
    return new EventSourcePolyfill(url, options);
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
    
    console.log('🔍 SSE 연결 시도:', {
      url,
      hasToken: !!authStore.accessToken,
      tokenLength: authStore.accessToken.length,
      tokenPrefix: authStore.accessToken.substring(0, 20) + '...'
    });
    
    const options = {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Accept': 'text/event-stream'
      }
    };
    
    return this.createEventSource(url, options);
  }
};

export default ssePolyfillService;

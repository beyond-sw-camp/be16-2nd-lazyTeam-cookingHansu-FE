<template>
  <div class="address-field">
    <label class="form-label">가게 주소 <span class="required">*</span></label>
    <div
      class="form-btn"
      @click="openPostcode"
      :class="{ empty: !address }"
    >
      {{ address || '클릭하여 가게 주소를 입력하세요.' }}
    </div>
    <div v-if="hasError" class="input-error">
      <span class="error-icon">&#10006;</span> 가게 주소를 입력해 주세요!
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  hasError: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'input']);

const address = ref(props.modelValue);

// 부모로부터 받은 값이 변경되면 로컬 상태 업데이트
watch(() => props.modelValue, (newValue) => {
  address.value = newValue;
});

// 로컬 상태가 변경되면 부모에게 알림
watch(address, (newValue) => {
  emit('update:modelValue', newValue);
  emit('input', newValue);
});

const openPostcode = () => {
  // 카카오 주소 API가 로드되었는지 확인
  if (typeof window.daum === 'undefined' || !window.daum.Postcode) {
    console.error('카카오 주소 API가 로드되지 않았습니다.');
    alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      // 도로명 주소가 있으면 도로명 주소, 없으면 지번 주소 사용
      const selectedAddress = data.roadAddress || data.jibunAddress;
      address.value = selectedAddress;
      
      // 추가 주소 정보가 있으면 포함
      if (data.buildingName) {
        address.value += ` (${data.buildingName})`;
      }
      
      // input 이벤트 발생시켜 에러 상태 해제
      emit('input', address.value);
    },
    onclose: (state) => {
      // 팝업이 닫힐 때의 상태 처리
      if (state === 'FORCE_CLOSE') {
      } else if (state === 'COMPLETE_CLOSE') {
      }
    }
  }).open();
};

onMounted(() => {
  // 컴포넌트 마운트 시 초기값 설정
  address.value = props.modelValue;
});
</script>

<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';

.address-field {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 6px;
}

.required {
  color: #ff884d;
  font-size: 1.1em;
  margin-left: 2px;
}

.form-btn {
  width: 100%;
  min-height: 52px;
  border: 1.5px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 1.08rem;
  margin-bottom: 4px;
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
  transition: border 0.18s;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-btn:hover {
  border-color: #007bff;
}

.form-btn.empty {
  color: #bdbdbd;
}

.input-error {
  color: #e53935;
  font-size: 0.97rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
}

.error-icon {
  font-size: 1.1em;
  margin-right: 2px;
}
</style>

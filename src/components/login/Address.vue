<template>
  <div class="address-field">
    <label class="form-label">가게 주소 <span class="required">*</span></label>
    <div
      class="form-btn"
      @click="openPostcode"
      :class="{ empty: !roadAddress }"
    >
      {{ roadAddress || '클릭하여 가게 주소를 입력하세요.' }}
    </div>
  </div>
</template>

<script>
export default {
  name: "PostCode",
  data() {
    return {
      roadAddress: "",
    };
  },
  methods: {
    openPostcode() {
      new window.daum.Postcode({
        oncomplete: (data) => {
          this.roadAddress = data.roadAddress;
        },
      }).open();
    },
  },
};
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
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
  transition: border 0.18s;
  display: flex;
  align-items: center;
}

.form-btn.empty {
  color: #bdbdbd;
}
</style>

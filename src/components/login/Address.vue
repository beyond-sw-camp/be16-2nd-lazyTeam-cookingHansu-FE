<template>
    <!-- 가게 주소 -->
    <label class="form-label">가게 주소 <span class="required">*</span></label>
        <div class="form-btn" @click="openPostcode" placeholder="가게 주소를 입력하세요" />
</template>
<script>
export default {
    name: "PostCode", 
    data() {
        return {
            roadAddress: "",
        };
    },
    setup() {},
    created() {}, 
    mounted() {}, 
    unmounted() {},
    methods: {
        openPostcode() {
            new window.daum.Postcode({
                oncomplete: (data) => {
                    console.log(data);
                    this.zonecode = data.zonecode;
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
.form-label {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 2px;
}
.required {
  color: #ff884d;
  font-size: 1.1em;
  margin-left: 2px;
}
.form-btn {
  width: 100%;
  height: 52px;
  border: 1.5px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 1.08rem;
  font-family: inherit;
  margin-bottom: 4px;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
  transition: border 0.18s;
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
</style>
<template>
  <CommonModal
    :model-value="visible"
    type="success"
    title="다시 뵙게 되어 기쁩니다!"
    message="회원 탈퇴 후 재로그인을 통해 복구되었습니다. 이전 기록이 남아있어 복구했으며, 더 나은 서비스를 제공하겠습니다."
    :show-cancel-button="false"
    confirm-text="확인"
    @confirm="handleConfirm"
    @update:model-value="$emit('update:visible', $event)"
  />
</template>

<script>
import CommonModal from './CommonModal.vue';

export default {
  name: 'UserRestoreModal',
  components: {
    CommonModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'confirm'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    }
  }
};
</script>

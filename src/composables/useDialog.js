import { ref } from 'vue';

export function useDialog() {
  const showImageDialog = ref(false);
  const selectedImageUrl = ref('');
  const showNameEditDialog = ref(false);
  const showLeaveConfirmDialog = ref(false);
  const newRoomName = ref('');

  const openImage = (imageUrl) => {
    selectedImageUrl.value = imageUrl;
    showImageDialog.value = true;
  };

  const closeImageDialog = () => {
    showImageDialog.value = false;
    selectedImageUrl.value = '';
  };

  const resetNameEditDialog = () => {
    showNameEditDialog.value = false;
    newRoomName.value = '';
  };

  const resetLeaveConfirmDialog = () => {
    showLeaveConfirmDialog.value = false;
  };

  return {
    showImageDialog,
    selectedImageUrl,
    showNameEditDialog,
    showLeaveConfirmDialog,
    newRoomName,
    openImage,
    closeImageDialog,
    resetNameEditDialog,
    resetLeaveConfirmDialog
  };
} 
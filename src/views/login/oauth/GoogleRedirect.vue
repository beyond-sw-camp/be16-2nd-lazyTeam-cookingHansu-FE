<template>
  <div>Google Redirect ...</div>
</template>

<script>
export default {
  created() {
    const code = new URLSearchParams(window.location.href).searchParams.get(
      "code"
    );
    console.log(code);
  },
};
</script>

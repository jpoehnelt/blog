import Alpine from "alpinejs";

window.Alpine = Alpine;

window.fetchUserInfo = async () => {
  return (await fetch("/auth/userinfo")).json().catch(() => ({}));
};

Alpine.start();

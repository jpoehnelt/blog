import debounce from "debounce-fn";

window.addEventListener("load", () => {
  let cid;

  if (document.cookie) {
    cid = document.cookie.split(";")[0].split("=").pop();
  }

  if (!cid) {
    cid = crypto.randomUUID();
    document.cookie = `cid=${cid}; path=/`;
  }

  const rand = () => crypto.randomUUID().slice(1, 5);
  const dr = document.referrer;
  const dl = window.location.href;
  const dt = document.title;

  const el = document.getElementById("secure");
  const img = document.createElement("img");
  img.classList.add("h-4", "w-4", "inline");
  img.alt = "privacy badge";

  const send = (params) => {
    params = {
      cid,
      dr,
      dl,
      dt,
      z: rand(),
      ...params,
    };
    const ENC = {
      "+": "-",
      "/": "_",
      "=": ".",
    };

    const qs = btoa(JSON.stringify(params)).replace(/[+/=]/g, (m) => ENC[m]);

    img.src = `/secure.svg?q=${qs}`;

    if (el.childElementCount === 0) {
      el.appendChild(img);
    }
  };

  send({ t: "pageview" });

  window.onerror = function (message) {
    send({ t: "exception", ni: "1", exd: message });
  };

  for (let a of document.getElementsByTagName("a")) {
    a.addEventListener("click", () => {
      if (
        !a.href.startsWith("/") &&
        !a.href.startsWith("https://justin.poehnelt.com")
      ) {
        send({ t: "event", ec: "outbound", ea: "click", el: a.href });
      }
      return false;
    });
  }

  document.onselectionchange = debounce(
    () => {
      const el = document.getSelection().toString();

      if (el.length > 4) {
        send({ t: "event", ec: "interact", ea: "select", el });
      }
      return false;
    },
    { wait: 300 }
  );
});

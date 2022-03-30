import "../styles/tailwind.css";


window.addEventListener("load", () => {
  let cid;

  if (document.cookie) {
    cid = document.cookie.split(";")[0].split("=").pop()
  }

  if (!cid) {
    cid = crypto.randomUUID().slice(1, 4);
    document.cookie = `cid=${cid}; path=/`;
  }

  const rand = () => crypto.randomUUID().slice(1, 5);
  const dr = document.referrer;
  const dl = window.location.href;
  const dt = document.title;

  const el = document.getElementById('secure');
  const img = document.createElement('img')
  img.classList.add('h-4', 'w-4', 'inline');

  const send = (params) => {
    params = {
      cid,
      dr,
      dl,
      dt,
      z: rand(),
      ...params
    }
    const ENC = {
      '+': '-',
      '/': '_',
      '=': '.'
    }

    const qs = btoa(JSON.stringify(params)).replace(/[+/=]/g, (m) => ENC[m])

    img.src = `/secure.svg?q=${qs}`

    if (el.childElementCount === 0) {
      el.appendChild(img);
    }
  }

  send({ t: 'pageview' });

  window.onerror = function (message) {
    send({ t: 'exception', ni: '1', exd: message });
  }
});

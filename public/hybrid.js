!function(){'use strict';
const cookieManager={
  get:(e)=>document.cookie.split('; ').reduce((n,t)=>{const[o,r]=t.split('=');return o===decodeURIComponent(e)?decodeURIComponent(r):n},null),
  set:(e,n,t=864e5)=>{const o=new Date;o.setTime(o.getTime()+t),document.cookie=`${encodeURIComponent(e)}=${encodeURIComponent(n)};expires=${o.toUTCString()};path=/;SameSite=Lax;${location.protocol==='https:'?'Secure;':''}`}
};


const initTracking=async()=>{
  
  if(!cookieManager.get('PID')){
    const uid=Math.random().toString(36).substr(2,9)+Date.now().toString(36);
    cookieManager.set('PID',uid);
  }

  const currentReferrer=document.referrer;
  if(cookieManager.get('AID')!==currentReferrer){
    cookieManager.set('AID',currentReferrer);
  }

  const payload={
    origin:window.location.hostname,
    pid:cookieManager.get('PID'),
    referrer:currentReferrer,
    url:window.location.href,
    ua:navigator.userAgent,
    t:Date.now() 
  };

  try{
    const res=await fetch('https://www.tracktraffics.com/api/track-data',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });

    const data=await res.json();

    if(data.track_url){
      const img=new Image();
      img.src=`${data.track_url}?_=${Date.now()}`; 
      img.style.display='none';
      document.body.appendChild(img);
    }

  }catch(err){
    console.error('Tracking Error:',err);
  }
};


document.readyState==='complete'?initTracking():window.addEventListener('load',initTracking);
}();
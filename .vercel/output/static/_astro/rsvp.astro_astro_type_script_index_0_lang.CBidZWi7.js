let s=1;const c=4,a=document.getElementById("add-guest-btn"),v=document.getElementById("guests-container");a?.addEventListener("click",()=>{if(s>=c){a&&(a.disabled=!0,a.classList.add("opacity-50","cursor-not-allowed"));return}s++;const e=document.createElement("div");e.className="guest-group",e.setAttribute("data-guest-index",s.toString()),e.innerHTML=`
      <label class="text-gray-700 font-roboto-condensed text-[12px] font-semibold uppercase mb-2 block">
        GUEST ${s}
      </label>
      <div class="flex gap-3">
        <input
          type="text"
          name="guest_${s}_first"
          placeholder="First Name"
          class="flex-1 bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder:text-gray-400 font-roboto-condensed text-[15px] outline-none focus:border-[#CE1141] focus:ring-1 focus:ring-[#CE1141]"
        />
        <input
          type="text"
          name="guest_${s}_last"
          placeholder="Last Name"
          class="flex-1 bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder:text-gray-400 font-roboto-condensed text-[15px] outline-none focus:border-[#CE1141] focus:ring-1 focus:ring-[#CE1141]"
        />
      </div>
    `,v?.appendChild(e),s>=c&&a&&(a.disabled=!0,a.classList.add("opacity-50","cursor-not-allowed"))});let i=1;const l=document.getElementById("add-guest-btn-mobile"),L=document.getElementById("guests-container-mobile");l?.addEventListener("click",()=>{if(i>=c){l&&(l.disabled=!0,l.classList.add("opacity-50","cursor-not-allowed"));return}i++;const e=document.createElement("div");e.className="guest-group",e.setAttribute("data-guest-index",i.toString()),e.innerHTML=`
      <label class="text-gray-700 font-roboto-condensed text-[12px] font-semibold uppercase mb-2 block">
        GUEST ${i}
      </label>
      <div class="flex gap-3 w-full">
        <input
          type="text"
          name="guest_${i}_first"
          placeholder="First Name"
          class="w-1/2 min-w-0 bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder:text-gray-400 font-roboto-condensed text-[15px] outline-none focus:border-[#CE1141] focus:ring-1 focus:ring-[#CE1141]"
        />
        <input
          type="text"
          name="guest_${i}_last"
          placeholder="Last Name"
          class="w-1/2 min-w-0 bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder:text-gray-400 font-roboto-condensed text-[15px] outline-none focus:border-[#CE1141] focus:ring-1 focus:ring-[#CE1141]"
        />
      </div>
    `,L?.appendChild(e),i>=c&&l&&(l.disabled=!0,l.classList.add("opacity-50","cursor-not-allowed"))});document.getElementById("non-player-form")?.addEventListener("submit",async e=>{e.preventDefault(),await b(e.target,"registration-action","registration-error","register-button")});document.getElementById("non-player-form-mobile")?.addEventListener("submit",async e=>{e.preventDefault(),await b(e.target,"registration-action-mobile","registration-error-mobile","register-button-mobile")});async function b(e,f,y,x){const h=new FormData(e),o=Object.fromEntries(h.entries());let u;o.name?u=o.name:o.first_name&&o.last_name?u=`${o.first_name} ${o.last_name}`:u="";const g=[];for(let r=1;r<=c;r++){const m=o[`guest_${r}_first`]?.trim(),p=o[`guest_${r}_last`]?.trim();m&&p&&g.push({name:`${m} ${p}`,email:o.email||"",phone:o.phone||""})}const w=1+g.length,E={name:u,email:o.email,phone:o.phone,ticket_count:w,additional_tickets:g};document.getElementById(f);const n=document.getElementById(y),t=document.getElementById(x);n&&(n.textContent="",n.classList.add("hidden"));let d=null;t&&(d=t.innerHTML,t.setAttribute("disabled","true"),t.classList.add("opacity-60","cursor-not-allowed"),t.setAttribute("aria-busy","true"),t.innerHTML=`
        <span class="inline-flex items-center gap-3">
          <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Submitting...
        </span>
      `);try{const r=await fetch("/api/non-player-signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(E)});if(r.ok)window.location.href="/non-players/success";else{const m=await r.json().catch(()=>({}));console.error("Server error:",m),n&&(n.textContent="Something went wrong. Please try again.",n.classList.remove("hidden")),t&&d!==null&&(t.removeAttribute("disabled"),t.classList.remove("opacity-60","cursor-not-allowed"),t.removeAttribute("aria-busy"),t.innerHTML=d)}}catch(r){console.error("Form submission error:",r),n&&(n.textContent="Something went wrong. Please try again.",n.classList.remove("hidden")),t&&d!==null&&(t.removeAttribute("disabled"),t.classList.remove("opacity-60","cursor-not-allowed"),t.removeAttribute("aria-busy"),t.innerHTML=d)}}

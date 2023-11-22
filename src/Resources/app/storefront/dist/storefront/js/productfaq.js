"use strict";(self.webpackChunk=self.webpackChunk||[]).push([["productfaq"],{5889:(e,t,n)=>{var a=n(6285),s=n(8254);class l extends a.Z{init(){this._client=new s.Z,this._registerEvents()}_registerEvents(){var e=document.querySelectorAll("#askquebtn"),t=document.querySelectorAll("#closeform"),n=document.querySelectorAll("#que_submit"),a=document.getElementsByClassName("product-faq-list");if(e.length)for(var s=0;s<e.length;s++)e[s].addEventListener("click",this._formShow.bind(this)),t[s].addEventListener("click",this._formHide.bind(this)),n[s].addEventListener("click",this._formSubmit.bind(this));var l=document.getElementsByClassName("faq-page");for(s=0;s<l.length;s++)l[s].addEventListener("click",this._faqPagination.bind(this));if(a.length){var o=document.getElementsByClassName("que_content"),r=document.getElementsByClassName("answer-section");Array.from(o).forEach((function(e,t){e.addEventListener("click",(function(){"none"===r[t].style.display?(e.classList.add("active"),r[t].style.display="block"):(r[t].style.display="none",e.classList.remove("active"))}))}))}}_formShow(e){for(var t=document.querySelectorAll("#askquebtn"),n=document.querySelectorAll("#askqueform"),a=0;a<t.length;a++)t[a].style.display="none",n[a].style.display="inline-block"}_formHide(e){for(var t=document.querySelectorAll("#askquebtn"),n=document.querySelectorAll("#askqueform"),a=0;a<t.length;a++)t[a].style.display="inline-block",n[a].style.display="none"}_formValidate(){var e=document.querySelectorAll("#askqueform"),t=e[e.length-1].querySelectorAll("textarea, input"),n={},a=!1;return t.forEach((function(e){if(e.value){s=document.querySelectorAll("#"+e.name+"-error");const n=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if("email"!==e.name||n.test(e.value)){if(s.length)for(t=0;t<s.length;t++)s[t].style.display="none"}else if(a=!0,s.length)for(var t=0;t<s.length;t++)s[t].style.display="inline-block"}else{var s;if(a=!0,(s=document.querySelectorAll("#"+e.name+"-error")).length)for(var t=0;t<s.length;t++)s[t].style.display="inline-block"}n[e.name]=e.value})),!a&&n}_formSubmit(e){e.preventDefault();var t=this._formValidate(),n=document.getElementById("queform").action;if(t){var a=JSON.stringify(t);this._client.post(n,a,(e=>{location.reload(!0)}))}}_faqPagination(e){if(!1===e.target.classList.contains("active")){var t=document.getElementsByClassName("faq-page"),n=document.getElementById("product-faq-pagination-pages"),a=n.getAttribute("data-url"),s=n.getAttribute("data-product"),l=parseInt(n.getAttribute("data-limit")),o=parseInt(n.getAttribute("data-total"));Array.from(t).forEach((function(e){e.classList.remove("active")})),e.target.classList.add("active");var r=parseInt(e.target.textContent),i=JSON.stringify({pageNumber:r,product:s,limit:l});this._client.post(a,i,(e=>{const t=JSON.parse(e);if(200===t.status&&t.data.length){var n="";t.data.forEach((function(e){var t='<div class="product-faq-item">\n                                            <div class="que_content">\n                                                <span class="que_icon">\n                                                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --\x3e<path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"></path></svg>\n                                                </span>\n                                                <span class="que_content_text">\n                                                    '+e.question+'\n                                                </span>\n                                                <span class="angle_arrow">\n                                                    <svg xmlns="http://www.w3.org/2000/svg" height="27" viewBox="0 -960 960 960"><path d="M480-345 240-585l43-43 197 198 197-197 43 43-240 239Z"></path></svg>\n                                                </span>\n                                            </div>\n                                            <div class="answer-section" style="display: none;">\n                                                <div class="answer-section-text">\n                                                '+e.answer+"\n                                                </div>\n                                            </div>\n                                           </div>";n+=t}));for(var a=0;a<document.querySelectorAll("#product-faq-items").length;a++)document.querySelectorAll("#product-faq-items")[a].innerHTML=n;var s=l*(r-1)+1,i=s+l,c="<p>Items "+s+" to "+(i=i<o?i:o)+" of "+o+" total</p>";for(a=0;a<document.querySelectorAll("#product-faq-pagination-total").length;a++)document.querySelectorAll("#product-faq-pagination-total")[a].innerHTML=c;var d=document.getElementsByClassName("que_content"),u=document.getElementsByClassName("answer-section");Array.from(d).forEach((function(e,t){e.addEventListener("click",(function(){"none"===u[t].style.display?(e.classList.add("active"),u[t].style.display="block"):(u[t].style.display="none",e.classList.remove("active"))}))}))}}))}}}window.PluginManager.register("Productfaq",l,"[data-productfaq]")}},e=>{e.O(0,["vendor-node","vendor-shared"],(()=>{return t=5889,e(e.s=t);var t}));e.O()}]);
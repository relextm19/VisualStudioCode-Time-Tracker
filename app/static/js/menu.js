document.addEventListener("DOMContentLoaded", () =>{
    const menuDiv = document.querySelector(".menu");
    const menu = document.querySelector("nav");

    menuDiv.onmouseenter = function(){ 
        menu.classList.remove("menuDisactive");
        menu.classList.add("menuActive");
    }

    menuDiv.onmouseleave = function(){
        menu.classList.remove("menuActive");
        menu.classList.add("menuDisactive");
    }
});

document.addEventListener("DOMContentLoaded", () =>{
    var menuDiv = document.querySelector(".menu");
    var menu = document.querySelector("nav");

    menuDiv.onmouseenter = function(){ 
        menu.classList.remove("menuDisactive");
        menu.classList.add("menuActive");
    }

    menuDiv.onmouseleave = function(){
        menu.classList.remove("menuActive");
        menu.classList.add("menuDisactive");
    }
});

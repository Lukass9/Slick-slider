class Slider {
  constructor(elemSelector){
    this.firstElem = 0;
    this.lastElem = null;
    this.currentSlide = 0; //aktualny slide
    this.sliderSelector = elemSelector; //selektor elementu który zamienimy na slider
    this.elem = null; //tutaj pobierzemy element który zamienimy na slider
    this.slider = null; //tutaj wygenerujemy slider
    this.slides = null; //tutaj pobierzemy slajdy
    this.prev = null; //przycisk prev
    this.next = null; //przycisk next
    this.blockPrev = null; // blok o jeden niższy niż środkowy reagujący jak przycisk prev
    this.bindBlockPrev = this.slidePrev.bind(this);
    this.blockNext = null; // blok o jeden wyższy niż środkowy reagujący jak przycisk next
    this.bindBlockNext = this.slideNext.bind(this);
    
    // this.styleBlock = null;// do usunięcia
    this.halfDistanceOfBlock = null;
    
    this.flagAnimation = false;
    
    
    ///////////move////////////////
    this.moveAnimation = null;
    this.showHidenBlocks = null
    this.removeCloneBlocks = null;
    ///////////////////////////////
        
    this.generateSlider();
  }
   
  generateSlider(){
    this.slider = document.querySelector(this.sliderSelector);
    this.slider.classList.add("slider");
    
    const slidesCnt = document.createElement("div");
    slidesCnt.classList.add("slick-cnt");
    
    this.slides = this.slider.children;
    
    let i = 1;
    while(this.slides.length){
      this.slides[0].classList.add("slider-slide");
      this.slides[0].innerHTML = i;
      
      // if(evenNumber){
      //   this.slides[0].setAttribute("style", "position: relative; left: 75px;");
      // }
      
      slidesCnt.appendChild(this.slides[0]);
      i++;
    }
    
    this.slides = slidesCnt.querySelectorAll(".slider-slide");
    this.lastElem = this.slides.length-1;
    
    this.currentSlide = Math.ceil(this.slides.length/2)-1;
    this.slides[this.currentSlide].classList.add("block-active");

    
    this.setInvisibleBlock();   
    this.slider.appendChild(slidesCnt);
    this.createPrevNext();  
    
    const styleBlock = getComputedStyle(this.slides[0]);
    this.halfDistanceOfBlock = (parseInt(styleBlock.width) + (parseInt(styleBlock.margin)*2)) / 2;
    //////////////check this number of slide is even///////////////////////////
    let evenNumber = false;
    if((this.slides.length)%2 == 0 ){
      evenNumber = true;
    }
    ////////////////////////////////////////
    if(evenNumber){
      for(const slide of this.slides){
         slide.setAttribute("style", 'position: relative; left:'+ this.halfDistanceOfBlock +'px;');
      }
    }
   
    this.createPrevNextBlocks();
    
  }
  createPrevNext(){
    this.prev = document.createElement("button");
    this.prev.type="button";
    this.prev.classList.add("btn-back");
    this.prev.addEventListener("click", this.slidePrev.bind(this));
    
    this.next = document.createElement("button");
    this.next.type="button";
    this.next.classList.add("btn-next");
    this.next.addEventListener("click", this.slideNext.bind(this));
    // console.log("this.next = ", this.next.getEventListeners());
    
    const nav = document.createElement("div");
    nav.classList.add("nav");
    nav.appendChild(this.prev);
    nav.appendChild(this.next);
    this.slider.appendChild(nav);
  }
  createPrevNextBlocks(){ 
    this.blockPrev = this.slides[this.currentSlide-1];
    this.blockPrev.style.cursor="pointer";
    this.blockPrev.addEventListener("click", this.bindBlockPrev);
    

    
    this.blockNext = this.slides[this.currentSlide+1];
    this.blockNext.style.cursor="pointer";
    this.blockNext.addEventListener("click", this.bindBlockNext); 

  }
  removeRegister(){
    this.blockPrev.removeEventListener("click", this.bindBlockPrev);
    this.blockPrev.style.cursor = "default";

    this.blockNext.removeEventListener("click", this.bindBlockNext);
    this.blockNext.style.cursor = "default";
  }
  newRegister(number){
    let leftSlide;
    let rightSlide;
    if(number == -1){ // left
      leftSlide = this.currentSlide - 2; 
      if(this.currentSlide == 0) leftSlide = this.slides.length-2;  
      if(leftSlide < 0) leftSlide = this.slides.length-1;  
      rightSlide = this.currentSlide;
    }
    else  if(number == 1){ // right
      leftSlide = this.currentSlide; 
      rightSlide = this.currentSlide + 2;
      if(this.currentSlide == this.slides.length-1) rightSlide = 1;  
      if(rightSlide > this.slides.length-1 ) rightSlide = 0;  
    }
   
    
    this.blockPrev = this.slides[leftSlide];
    this.blockNext = this.slides[rightSlide];
    
    this.blockPrev.style.cursor="pointer";
    this.blockNext.style.cursor = "pointer";

    
    this.blockPrev.addEventListener("click", this.bindBlockPrev);
    this.blockNext.addEventListener("click", this.bindBlockNext);
  }
  
  slidePrev(){
    if(!this.flagAnimation){
      this.flagAnimation = true;

      this.removeBlocks();
      let clone_block = null;    
      clearTimeout(this.moveAnimation);
      clearTimeout(this.showHidenBlocks);
      clearTimeout(this.removeCloneBlocks);
      // this.clone_block.remove();

      this.slides[this.firstElem].classList.remove("block-inv");
      this.slides[this.lastElem].classList.remove("block-inv");
      this.slides[this.currentSlide].classList.remove("block-active");

      const slick_cnt = document.querySelector(".slick-cnt");
      const lastElement = this.slides[this.lastElem];
      const firstElement = this.slides[this.firstElem];


      //////////////////promise//////////////////////////////////////////   
      clone_block = this.cloneBlock(false);
      const coppy_slides = clone_block.children;

      const hidenBlocksPromise = ()=> {
        return new Promise((resolve, reject)=>{
          setTimeout(() => {
            const slick_cnt = document.querySelector(".slick-cnt");
            slick_cnt.appendChild(clone_block);
            this.hideBlocks(this.slides);
            resolve();
          }, 300)
        })
      }
      const moveAnimation = () => {
        return new Promise((resolve, reject) => {  

          setTimeout(() => {  // przesuwa bloki
            for(const slide of coppy_slides){
              slide.style.setProperty("--transX", this.halfDistanceOfBlock+"px"); // 75
            }
            resolve();
          }, 20) 
        })      
      }    
      const showHidenBlocks1 = () => {
        return new Promise((resolve, reject) => {
          setTimeout(()=>{
            lastElement.remove();
            slick_cnt.insertBefore(lastElement,firstElement);
            this.showBlocks(this.slides);   
            resolve();
          },250); // pokazuje ukryte elementy

        })
      }   
      const removeCloneBlocks1 = ()=> {
        new Promise((resolve, reject) =>{
          setTimeout(() => {
            this.currentSlide--;
            if(this.currentSlide < 0){
              this.currentSlide = this.slides.length-1;
            }

            this.slides[this.currentSlide].classList.add("block-active");

            this.lastElem--;
            if(this.lastElem < 0){
              this.lastElem = this.slides.length-1;
            }
            this.firstElem--;
            if(this.firstElem < 0){
              this.firstElem = this.slides.length-1;
            }

            this.setInvisibleBlock();   

            clone_block.remove();
            this.flagAnimation = false;
          },100); // obliczenia i usuwa sklonowane elementy
          resolve();
        })
      }
      const blockEvent = ()=> {
        new Promise((resolve, reject) =>{
          this.removeRegister();
          this.newRegister(-1);
          resolve();
        }) 
      }
      
      async function animation(){
        await hidenBlocksPromise();
        await moveAnimation();
        await showHidenBlocks1();
        await removeCloneBlocks1();
        await blockEvent();
      }
      animation();
    }
  }
  slideNext(){
    
    if(!this.flagAnimation){
      this.flagAnimation = true;
      
      this.removeBlocks();
      let clone_block = null;    
      clearTimeout(this.moveAnimation);
      clearTimeout(this.showHidenBlocks);
      clearTimeout(this.removeCloneBlocks);
      // this.clone_block.remove();

      this.slides[this.firstElem].classList.remove("block-inv");
      this.slides[this.lastElem].classList.remove("block-inv");
      this.slides[this.currentSlide].classList.remove("block-active");

      const slick_cnt = document.querySelector(".slick-cnt");
      const lastElement = this.slides[this.lastElem];
      const firstElement = this.slides[this.firstElem];


      //////////////////promise//////////////////////////////////////////   
      clone_block = this.cloneBlock(true);
      const coppy_slides = clone_block.children;

      const hidenBlocksPromise = ()=> {
        return new Promise((resolve, reject)=>{
          setTimeout(() => {
            const slick_cnt = document.querySelector(".slick-cnt");
            slick_cnt.appendChild(clone_block);
            this.hideBlocks(this.slides);
            resolve();
          }, 300)
        })
      }
      const moveAnimation = () => {
        return new Promise((resolve, reject) => {  

          setTimeout(() => {  // przesuwa bloki
            for(const slide of coppy_slides){
              slide.style.setProperty("--transX", -this.halfDistanceOfBlock+"px");
            }
            resolve();
          }, 20) 
        })      
      }    
      const showHidenBlocks1 = () => {
        return new Promise((resolve, reject) => {
          setTimeout(()=>{
            firstElement.remove();
            slick_cnt.appendChild(firstElement);
            this.showBlocks(this.slides);   
            resolve();
          },250); // pokazuje ukryte elementy

        })
      }   
      const removeCloneBlocks1 = ()=> {
        new Promise((resolve, reject) =>{
          setTimeout(() => {
            this.currentSlide++;
            if(this.currentSlide > this.slides.length-1){
              this.currentSlide = 0;
            }

            this.slides[this.currentSlide].classList.add("block-active");

            this.lastElem++;
            if(this.lastElem > this.slides.length-1){
              this.lastElem = 0;
            }
            this.firstElem++;
            if(this.firstElem > this.slides.length-1){
              this.firstElem = 0;
            }

            this.setInvisibleBlock();   

            clone_block.remove();
            this.flagAnimation = false;
          },100); // obliczenia i usuwa sklonowane elementy
          resolve();   
        })
      } 

      const blockEvent = ()=> {
        new Promise((resolve, reject) =>{
          this.removeRegister();
          this.newRegister(1);
          resolve();
        }) 
      }
      async function animation(){
        await hidenBlocksPromise();
        await moveAnimation();
        await showHidenBlocks1();
        await removeCloneBlocks1();
        await blockEvent();
      }
      animation();
    }     
  } 
  setInvisibleBlock(){
    this.slides[this.firstElem].classList.add("block-inv");
    this.slides[this.lastElem].classList.add("block-inv");
    
  }
  cloneBlock(direction){
    const slick_cnt = document.querySelector(".slick-cnt");
    const coppy_slick_cnt = slick_cnt.cloneNode(true);
    coppy_slick_cnt.classList.remove("slick-cnt");
    coppy_slick_cnt.classList.add("slick-cnt-coppy");
    const coppy_slides = coppy_slick_cnt.children;
        
    if(direction == true){ // nextSlide
      const coppyFirstSlide = coppy_slides[0].cloneNode(true);
      coppy_slick_cnt.appendChild(coppyFirstSlide);
      for(const slide of coppy_slides){
        slide.classList.add("block-coppy");
        slide.style.setProperty("--transX", this.halfDistanceOfBlock + "px"); //75
      }  
    }
    else if(direction == false){ // prevSlide
      const coppyLastSlide = coppy_slides[coppy_slides.length-1].cloneNode(true);
      coppy_slick_cnt.insertBefore(coppyLastSlide, coppy_slides[0]);
      for(const slide of coppy_slides){
        slide.classList.add("block-coppy");
        slide.style.setProperty("--transX", -this.halfDistanceOfBlock + "px"); // 75
      }  
    }
      
    // slick_cnt.appendChild(coppy_slick_cnt); 
    return coppy_slick_cnt;
  }  
  hideBlocks(blockToHide){
      for(const slide of blockToHide){
        slide.style.display = "none";
      }
  }
  showBlocks(hidenBlocks){
    for(const slide of hidenBlocks){
      slide.style.display = "block";
    }
  }
  removeBlocks(){
    const trash = document.querySelector(".slick-cnt-coppy");
    if(trash){
      trash.remove();
      const repair = document.querySelectorAll(".block");
        for(const slide of repair){
          slide.style.display = "block";
        }
    } 
  }
}
const slide = new Slider(".slick-slider");
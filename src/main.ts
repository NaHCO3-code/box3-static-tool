import './style.css'
import { getFileByHash, postFile, postText } from "./hash";

//hello world: QmWDXASJ7wW316RRQi57fSXTscfnZ7vN2mJXVkXE8t5m5a
//an image: QmeXTsiLfsZ3zskcMtA4D4nXMAKjBZ7CmNj8WLWQ6nSUrs

// 读取Hash
;(async function (){
  let inputEl = document.getElementById("readHash") as HTMLInputElement;
  let tipEl = document.querySelector(".read .tip") as HTMLParagraphElement;
  let previewEl = document.querySelector(".read .preview .frame") as HTMLIFrameElement;
  let inputFormEl = document.getElementById("readHashForm") as HTMLFormElement;

  if(!inputEl || !tipEl || !previewEl || !inputFormEl){
    return;
  }

  let fileName: null | string = null;
  let url: null | string = null;
  
  inputFormEl?.addEventListener("submit", async (ev) => {
    // 防止刷新
    ev.preventDefault();

    // 数据总量
    let byteNum = 0;

    // 提示
    tipEl.innerText = "正在启动传输……";

    try{
      // 传输进度
      let file = await getFileByHash(inputEl.value, (chunk)=>{
        byteNum += chunk.length;
        tipEl.innerText = `已接收${byteNum}字节……`
      })
      tipEl.innerText = `传输完毕！大小：${file.size}字节，文件类型：${file.type}`

      // 设置文件信息
      fileName = file.name;
      url = URL.createObjectURL(file);

      // 预览
      previewEl.src = url;      
    }catch(e){
      tipEl.innerText = `传输失败！${e}`
    }
  })

  // 在新标签页打开
  let openBtn = document.getElementById("open");
  openBtn?.addEventListener("click", ()=>{
    open(`//static.dao3.fun/block/${inputEl.value}`, "_blank")
  })

  // 下载
  let downloadBtn = document.getElementById("download");
  downloadBtn?.addEventListener("click", async ()=>{
    if(!url || !fileName){
      inputFormEl.submit();
    }
    let a = document.createElement('a');
    a.href = url ?? "";
    a.download = fileName ?? "";
    a.click();
  })
})();

// 上传文本
;(async function (){
  let inputEl = document.getElementById("postText") as HTMLInputElement;
  let tipEl = document.querySelector(".postText .tip") as HTMLParagraphElement;
  let inputFormEl = document.getElementById("postTextForm") as HTMLFormElement;

  if(!inputEl || !tipEl || !inputFormEl){
    return;
  }
  
  inputFormEl?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    tipEl.innerText = "正在启动传输……";
    let res = await postText(inputEl.value);
    tipEl.innerText = `传输成功！${JSON.stringify(res)}`;
  })
})();

// 上传文件
;(async function (){
  let inputEl = document.getElementById("postFile") as HTMLInputElement;
  let tipEl = document.querySelector(".postFile .tip") as HTMLParagraphElement;
  let inputFormEl = document.getElementById("postFileForm") as HTMLFormElement;

  if(!inputEl || !tipEl || !inputFormEl){
    return;
  }
  
  inputFormEl?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    tipEl.innerText = "传输中……";
    try{
      if(!inputEl.files || inputEl.files.length == 0){
        throw new Error("未选择文件");
      }
      const files = inputEl.files;
      for(const file of files){
        const size = file.size;
        const res = await postFile(file, (ev)=>{
          tipEl.innerText = `[${((size - ev.loaded)/size*100).toFixed(0)}%] 共${size}字节，已传输${ev.loaded}字节`
        });
        tipEl.innerText = `传输成功！${JSON.stringify(res)}`;        
      }
    }catch(e){
      tipEl.innerText = `错误：${e}`;
    }
  })
})();

// 预览组建
;(async function(){
  let previews = document.querySelectorAll(".preview");
  previews.forEach((preview) => {
    let btn = preview.querySelector(".change-preview-vis") as HTMLButtonElement;
    let frame = preview.querySelector(".frame") as HTMLIFrameElement;

    if(!btn || !frame){
      throw new Error("是谁偷偷动了我的DOM？")
    }

    btn?.addEventListener("click", ()=>{
      if(frame.classList.contains("hidden")){
        frame.classList.remove("hidden");
      }else{
        frame.classList.add("hidden");
      }
    })
  })
})();
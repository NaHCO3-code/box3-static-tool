import {MIME_SUFFIX, SUFFIX_MIME} from './fileType.js'

export async function* ReadStramByChunk(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let {done, value} = await reader.read();
  while(!done){
    yield value;
    ({done, value} = await reader.read());
  }
}


function MIME2Suffix(MIME: string){
  return MIME_SUFFIX[MIME] ?? "";
}

function suffix2MIME(suf:string){
  return SUFFIX_MIME[suf] ?? "application/octet-stream";
}

export async function FetchFile(
  url: RequestInfo | URL,
  nameGetter: (url: string, MIME: string) => string, 
  hook: (chunk: Uint8Array) => void, 
  init: RequestInit | undefined,
  MIME: string | null
){
  const res = await fetch(url, init);
  if(!res.ok || res.body === null){
    throw new Error(await res.text());
  }
   
  let content = [];
  for await (let chunk of ReadStramByChunk(res.body.getReader())){
    if(chunk === void 0){
      continue;
    }
    hook(chunk);
    content.push(chunk);
  }

  const type = MIME ?? res.headers.get("Content-Type") ?? "application/octet-stream";
  const name = nameGetter(url.toString(), type);
  return new File(content, name, {
    type,
  });
}


export async function getFileByHash(
  hash: string, 
  hook:(chunk: Uint8Array) => void=(()=>{}),
  MIME: string | null
){
  return FetchFile(
    `//static.dao3.fun/block/${hash}`,
    (_, MIME) => `${hash}${MIME2Suffix(MIME)}`,
    hook,
    {
      mode: "cors",
    },
    MIME
  )
}

export async function post(data: BodyInit | string | null | undefined, MIME: string) {
  const postResult = await fetch("//static.dao3.fun/block/", {
    method: "POST",
    headers: {
      "Content-Type": MIME,
    },
    body: data,
    mode: "cors"
  });
  const resultData = await postResult.json();
  return resultData;
}

export async function postText(data: string){
  return post(data, "text/plain");
}

export async function postFile(file: File, hook: (ev: ProgressEvent<FileReader>) => void){
  const MIME = suffix2MIME('.'+file.name.split('.').at(-1));
  const reader = new FileReader();
  return new Promise((res, rej)=>{
    reader.addEventListener("load", async function(){
      const data = reader.result
      res(await post(data, MIME));
    })
    reader.addEventListener("error", async function(e){
      rej(e);
    })
    reader.addEventListener("progress", hook);
    reader.readAsArrayBuffer(file);  
  })
}
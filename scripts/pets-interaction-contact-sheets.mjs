import sharp from 'sharp';
const dir='../tmp/pets-interaction-qa';
for(const [index,widths] of [[320,390],[600,768],[1024,1280],[1366,1440],[1920,2560]].entries()){
 const panels=[];let y=0;
 for(const width of widths){
  panels.push({input:Buffer.from(`<svg width="1430" height="30"><text x="12" y="22" font-size="18">${width}px — hero / controls / quiz / card</text></svg>`),left:0,top:y});y+=34;
  let height=0;
  for(const [i,name] of ['hero','controls','quiz-step1','card-expanded'].entries()){
   const {data,info}=await sharp(`${dir}/${name}-${width}.png`).resize(350).png().toBuffer({resolveWithObject:true});
   panels.push({input:data,left:i*360,top:y});height=Math.max(height,info.height);
  }
  y+=height+20;
 }
 await sharp({create:{width:1430,height:y,channels:3,background:'#ded7cb'}}).composite(panels).png().toFile(`${dir}/review-${index}.png`);
}

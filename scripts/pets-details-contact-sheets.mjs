import sharp from 'sharp';
const dir='../tmp/pets-details-polish';
for(const [group,widths] of [[0,[320,390,600,768,1024]],[1,[1280,1366,1440,1920,2560]]]){
  const panels=[];let y=0;
  for(const width of widths){
    const row=[];let height=0;
    for(const [i,name] of ['hero','pets-help','pets-meeting'].entries()){
      const {data,info}=await sharp(`${dir}/${name}-${width}.png`).resize(440).png().toBuffer({resolveWithObject:true});
      row.push({input:data,top:y,left:i*450});height=Math.max(height,info.height);
    }
    panels.push(...row);y+=height+12;
  }
  await sharp({create:{width:1340,height:y,channels:3,background:'#d9d1c3'}}).composite(panels).png().toFile(`${dir}/review-${group}.png`);
}

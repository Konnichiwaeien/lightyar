"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Heart, House, Moon, PawPrint, Ruler, Sun, Users, RotateCcw } from 'lucide-react';
import type { MappedPet } from '@/lib/helpers/pets/normalize-pet-data';

const questions = [
  {title:'Кого вы хотите взять домой?',options:[['any','Пока не знаю'],['dog','Собаку'],['cat','Кошку']]},
  {title:'Какого размера питомца вы ищете?',options:[['any','Размер не важен'],['small','Маленького'],['medium','Среднего'],['large','Большого']]},
  {title:'Какой ритм жизни вам ближе?',options:[['moderate','Прогулки и спокойный отдых'],['chill','Больше времени дома'],['active','Долгие прогулки и игры']]},
  {title:'С вами живут дети или другие животные?',options:[['no','Нет'],['yes','Да']]},
];
export function PetsMatchQuiz({pets}:{pets:MappedPet[]}) {
  const [step,setStep] = useState(0);
  const [answers,setAnswers] = useState(['any','any','moderate','no']);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{title.current?.focus({preventScroll:true});title.current?.closest('dialog')?.scrollTo({top:0,behavior:'instant'});},[step]);
  const results = step===4 ? pets.flatMap(pet=>{
    if(answers[0]==='dog' && pet.species!=='Собака' || answers[0]==='cat' && pet.species!=='Кошка') return [];
    let score=100;
    if(answers[1]!=='any' && answers[1]!==pet.size) score-=25;
    if(answers[2]==='chill' && pet.activity>3) score-=(pet.activity-3)*20;
    if(answers[2]==='active' && pet.activity<4) score-=(4-pet.activity)*20;
    if(answers[2]==='moderate' && (pet.activity===1 || pet.activity===5)) score-=15;
    if(answers[3]==='yes' && !pet.socialized) score-=25;
    if(answers[3]==='yes' && pet.friendliness<3) score-=(3-pet.friendliness)*15;
    return [{pet,score}];
  }).sort((a,b)=>b.score-a.score).slice(0,3) : [];
  const optionIcons = [Heart,Ruler,Sun,Users];
  const OptionIcon = optionIcons[step] || PawPrint;
  return <div className="pets-quiz__content">
    <h3 className="pets-quiz__heading" ref={title} tabIndex={-1}>{step===4 ? 'С кем можно познакомиться' : `Вопрос ${step+1} из 4`}</h3>
    {step<4 && <div className="pets-quiz__progress" role="progressbar" aria-label="Пройдено вопросов" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step}>{[0,1,2,3].map(n=><span key={n} data-filled={n<=step}/>)}</div>}
    {step<4 ? <form key={step} className="pets-quiz__step" onSubmit={event=>{event.preventDefault();setStep(value=>value+1);}}>
      <fieldset><legend>{questions[step].title}</legend><div className="pets-quiz__options" data-step={step}>{questions[step].options.map(([value,label])=><label key={value}><input type="radio" name={`question-${step}`} value={value} checked={answers[step]===value} onChange={()=>setAnswers(previous=>previous.map((answer,index)=>index===step ? value : answer))} /><span className="pets-quiz__option-art" aria-hidden="true">{step===0&&value!=='any' ? <Image src={value==='dog'?'/pets/cutout-tisha.webp':'/pets/cutout-tessi-hd.webp'} alt="" width={120} height={120} sizes="120px" /> : step===2&&value==='chill' ? <Moon/> : step===3&&value==='no' ? <House/> : <OptionIcon/>}</span><span className="pets-quiz__option-label">{label}</span><span className="pets-quiz__check" aria-hidden="true"><Check size={13}/></span></label>)}</div></fieldset>
      <div className="pets-quiz__actions">{step>0 && <button type="button" className="pets-quiz__back" onClick={()=>setStep(value=>value-1)}><ArrowLeft size={17} aria-hidden="true" />Назад</button>}<button className="pets-button" type="submit">{step===3 ? 'Показать питомцев' : 'Дальше'}<ArrowRight size={18} aria-hidden="true" /></button></div>
    </form> : <><p className="pets-quiz__note">Вот с кем можно начать знакомство. Если дома есть дети или другие животные, расскажите об этом куратору до встречи.</p>
      {results.length ? <ul className="pets-quiz__results">{results.map(({pet})=><li key={pet.id}><Link href={`/pets/${pet.slug || pet.id}`}><Image src={pet.image} width={240} height={260} sizes="(max-width:599px) 80px, 220px" alt="" /><span>{pet.name}<ArrowRight size={17} aria-hidden="true" /></span></Link></li>)}</ul> : <p>По этим ответам питомцев пока нет. Попробуйте выбрать другие варианты.</p>}
      <button className="pets-quiz__back" type="button" onClick={()=>{setAnswers(['any','any','moderate','no']);setStep(0);}}><RotateCcw size={16} aria-hidden="true" />Пройти заново</button>
    </>}
  </div>;
}

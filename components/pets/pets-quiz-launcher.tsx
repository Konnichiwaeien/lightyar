"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ListChecks, X } from 'lucide-react';
import type { MappedPet } from '@/lib/helpers/pets/normalize-pet-data';
import { useLenis } from '@/components/ui/smooth-scroll';
const Quiz = dynamic(() => import('./pets-match-quiz').then(module => module.PetsMatchQuiz), {loading:()=><p role="status">Загружаем вопросы…</p>});
export function PetsQuizLauncher() {
  const [open,setOpen] = useState(false);
  const [pets,setPets] = useState<MappedPet[] | null>(null);
  const [error,setError] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const {getLenis} = useLenis();
  useEffect(()=>{
    const dialog=panel.current;
    if(!open){dialog?.close();return;}
    dialog?.showModal();
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';getLenis()?.stop();
    return ()=>{document.body.style.overflow=previousOverflow;getLenis()?.start();};
  },[open,getLenis]);
  useEffect(() => {
    if(!open) return;
    if(pets) return;
    const controller = new AbortController();
    fetch('/api/pets/quiz',{signal:controller.signal}).then(response => {
      if(!response.ok) throw new Error('Quiz unavailable');
      return response.json();
    }).then((data:MappedPet[])=>{setPets(data);setError(false);}).catch(reason=>{if(reason.name!=='AbortError')setError(true);});
    return ()=>controller.abort();
  },[open,pets,attempt]);
  const close = () => {setOpen(false);trigger.current?.focus();};
  return <>
    <button ref={trigger} className="pets-button pets-button--light pets-quiz-trigger" type="button" aria-expanded={open} aria-controls="pets-quiz-panel" onClick={()=>setOpen(value=>!value)}><ListChecks size={20} aria-hidden="true" />Подобрать питомца <ArrowRight size={18} aria-hidden="true" /></button>
    <dialog ref={panel} id="pets-quiz-panel" className="pets-quiz" aria-label="Тест подбора питомца" data-lenis-prevent onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}}>
      <div className="pets-quiz__top"><span><ListChecks size={19} aria-hidden="true" />Знакомство начинается здесь</span><button className="pets-quiz__close" type="button" aria-label="Закрыть тест" onClick={close}><X size={20} aria-hidden="true" /></button></div>
      {open && (error ? <div role="alert"><p>Не удалось загрузить питомцев. Попробуйте ещё раз.</p><button className="pets-button" onClick={()=>{setError(false);setAttempt(value=>value+1);}}>Повторить</button></div> : pets ? <Quiz pets={pets} /> : <p role="status">Загружаем питомцев…</p>)}
    </dialog>
  </>;
}

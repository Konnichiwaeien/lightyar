import Image from 'next/image';
import { Suspense } from 'react';
import { ProfileCommunity } from './profile-community';
import { PawPrint } from 'lucide-react';
import { ProfilePhoto } from './profile-photo';
import { CampaignDonateForm } from '@/components/campaigns/campaign-donate-form';
import './profile-support.css';

export function ProfileSupport({ id, name, home, photo }: { id: string; name: string; home: boolean; photo?: string }) {
  return <section id="help-pet" className="pet-support pet-profile__section" aria-labelledby="pet-support-heading">
    <div className="pet-profile__container pet-support__layout">
      <div className="pet-support__copy">
        <h2 id="pet-support-heading">Помочь <em>питомцу</em></h2>
        <p>{home ? 'Этот питомец уже дома. Прежде чем помогать, уточните у приюта, нужна ли ему поддержка сейчас.' : 'Можно помочь с кормом, уходом и лечением — разово или каждый месяц. Выберите сумму, с которой вам удобно поддерживать питомца.'}</p>
        <Image src="/pets/decor-care-paper.webp" width={600} height={400} alt="" className="pet-support__art" />
        <a href="https://vk.com/im?sel=-228082117" target="_blank" rel="noopener noreferrer" className="pet-profile__text-link" aria-label="Обсудить помощь с приютом во ВКонтакте, откроется в новой вкладке">Обсудить помощь с приютом</a>
      </div>
      <div className="pet-support__form"><div className="pet-support__identity"><div className="pet-support__avatar">{photo ? <ProfilePhoto src={photo} fallbackSrc={photo} alt="" sizes="64px" /> : <PawPrint size={28} aria-hidden="true" />}</div><div><span>Вы помогаете питомцу</span><strong>{name}</strong></div></div><CampaignDonateForm key={id} initial={{ kind: 'pet', id, title: name, amount: 500 }} listenForIntent={false} lockIntent /><p className="pet-support__notice">Онлайн-оплата пока не подключена. Выбор суммы не списывает деньги.</p></div>
    </div>
    <Suspense fallback={<div className="pet-profile__container pet-support__community-loading" role="status">Загружаем сборы и помощников…</div>}><ProfileCommunity id={id} /></Suspense>
  </section>;
}

import Link from 'next/link';
import { ArrowUpRight, CalendarHeart, HandHeart, HeartHandshake, Target, UsersRound } from 'lucide-react';
import { campaignsService } from '@/lib/api/services/campaigns';
import { donationsService } from '@/lib/api/services/donations';

const money = (value: number) => `${Number(value).toLocaleString('ru-RU')} ₽`;
export async function ProfileCommunity({ id }: { id: string }) {
  const [campaigns, heroes] = await Promise.all([
    campaignsService.getCampaigns({ petId: id, status: 'active', limit: 3 }).catch(() => null),
    donationsService.getPetDonations(id),
  ]);
  return <div className="pet-profile__container pet-support__community">
    <section className="pet-support__funds" aria-labelledby="pet-funds-title">
      <h3 id="pet-funds-title"><Target size={22} aria-hidden="true" />Текущий сбор</h3>
      {campaigns === null ? <p className="pet-support__empty">Не удалось загрузить сборы. Попробуйте зайти позже.</p> : !campaigns.data.length ? <div className="pet-support__empty"><HeartHandshake size={30} aria-hidden="true" /><p>Отдельного сбора сейчас нет. Узнать, какая помощь нужна питомцу, можно у приюта.</p></div> : campaigns.data.map(fund => {
        const current = Math.max(0, Number(fund.current) || 0);
        const total = Math.max(0, Number(fund.total) || 0);
        return <article className="pet-support__fund" key={fund.documentId}><h4><Link href={`/campaigns/${fund.slug || fund.documentId}`}>{fund.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h4>{fund.shortDesc && <p>{fund.shortDesc}</p>}<div className="pet-support__fund-money"><strong>{money(current)}</strong>{total > 0 && <span>из {money(total)}</span>}</div>{total > 0 && <progress max={total} value={Math.min(current,total)} aria-label={`Собрано ${money(current)} из ${money(total)}`} />}<Link href={`/campaigns/${fund.slug || fund.documentId}`} className="pet-profile__text-link">Подробнее о сборе<ArrowUpRight size={16} aria-hidden="true" /></Link></article>;
      })}
    </section>
    <section className="pet-support__heroes" aria-labelledby="pet-heroes-title">
      <h3 id="pet-heroes-title"><UsersRound size={22} aria-hidden="true" />Наши герои</h3>
      {heroes.status !== 'ready' ? <div className="pet-support__empty"><HandHeart size={30} aria-hidden="true" /><p>{heroes.status === 'unavailable' ? 'Не удалось загрузить список помощников. Попробуйте зайти позже.' : 'Здесь появятся люди, которые поддержали этого питомца. Пока взносов через сайт нет.'}</p></div> : <ul className="pet-support__backers" tabIndex={0} aria-label="Последние взносы этому питомцу" data-lenis-prevent>{heroes.donations.map(donation => <li key={donation.documentId || donation.id}><span className="pet-support__backer-icon" aria-hidden="true">{donation.type === 'monthly' ? <CalendarHeart size={22} /> : <HandHeart size={22} />}</span><div><strong>{donation.donorName?.trim() || 'Анонимный помощник'}</strong><span>{donation.type === 'monthly' ? 'Опека · каждый месяц' : 'Разовый взнос'}</span></div><b>{money(donation.amount)}</b></li>)}</ul>}
    </section>
  </div>;
}

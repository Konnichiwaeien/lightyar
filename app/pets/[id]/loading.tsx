import { InnerHeader } from '@/components/layout/inner-header';
import '@/components/pets/pet-profile.css';

export default function PetProfileLoading() {
  return <div className="pet-profile"><InnerHeader /><main id="main-content" aria-busy="true"><span className="sr-only" role="status">Загружаем страницу питомца</span><div className="pet-profile__hero pet-profile__container" aria-hidden="true">
    <div className="pet-profile__breadcrumb"><span className="pet-profile__skeleton" style={{ width: 160, height: 44 }} /></div>
    <div className="pet-profile__portrait"><div className="pet-gallery__stage pet-profile__skeleton" /></div>
    <div className="pet-profile__intro"><div className="pet-profile__skeleton" style={{ width: 112, height: 36 }} /><div className="pet-profile__skeleton pet-profile__skeleton-title" /><div className="pet-profile__badges">{[92, 98, 84].map(width => <span key={width} className="pet-profile__skeleton" style={{ width, height: 34, borderRadius: 24 }} />)}</div></div>
    <div className="pet-profile__summary"><div className="pet-profile__skeleton pet-profile__skeleton-copy" /><div className="pet-profile__skeleton pet-profile__skeleton-button" /><div className="pet-profile__facts">{[0, 1, 2, 3].map(index => <span key={index} className="pet-profile__skeleton" style={{ height: 86, borderRadius: 18 }} />)}</div></div>
  </div></main></div>;
}

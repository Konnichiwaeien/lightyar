import './pets-skeleton.css';

export function PetsControlsSkeleton() {
  return <div className="pets-controls pets-skeleton-controls" aria-hidden="true">
    <div className="pets-controls__top">
      <div className="pets-search pets-skeleton-controls__search"><span className="pets-skeleton__line" /><span className="pets-skeleton__block pets-skeleton-controls__submit" /></div>
      <div className="pets-status pets-skeleton-controls__status"><span className="pets-skeleton__block" /><span className="pets-skeleton__line" /></div>
    </div>
    <div className="pets-controls__fields pets-skeleton-controls__fields">
      <span className="pets-skeleton__line pets-skeleton-controls__caption" />
      {[0,1,2,3,4].map(index=><span key={index} className="pets-skeleton__block pets-skeleton-controls__filter" />)}
    </div>
    <div className="pets-controls__mobile pets-skeleton-controls__mobile"><span className="pets-skeleton__block" /><span className="pets-skeleton__block" /></div>
  </div>;
}

export function PetsCatalogSkeleton() {
  return <>
    <PetsControlsSkeleton />
    <ul className="pets-grid pets-skeleton-grid" aria-hidden="true">
      {Array.from({length:12},(_,index)=><li key={index} className="pet-entry pets-skeleton-card">
        <div className="pet-entry__photo pets-skeleton__block"><span className="pets-skeleton-card__status" /><span className="pets-skeleton-card__favorite" /></div>
        <div className="pet-entry__body">
          <div className="pets-skeleton__line pets-skeleton-card__name" />
          <div className="pets-skeleton-card__badges">{[0,1,2,3].map(badge=><span key={badge} className="pets-skeleton__block" />)}</div>
          <div className="pets-skeleton-card__description"><span className="pets-skeleton__line" /><span className="pets-skeleton__line" /><span className="pets-skeleton__line" /></div>
          <div className="pets-skeleton-card__details"><span className="pets-skeleton__line" /></div>
          <div className="pets-skeleton__block pets-skeleton-card__button" />
        </div>
      </li>)}
    </ul>
  </>;
}

// @flow

import React from 'react';

import './modalShowKey.css';
import { getKeyStore } from '../../../lib/localStorage.lib';

const ModalShowKey = ({
  closeModal,
}: {
  closeModal: () => void,
}) => (
  <div className="modal is-active">
    <div
      className="modal-background"
      onClick={closeModal}
      role="button"
      aria-pressed="true"
      tabIndex="0"
    />
    <div className="modal-card">
      <section className="modal-card-header header-show-key">
        <h1>Votre clef de planning !</h1>
      </section>
      <section className="modal-card-body body-show-key">
        <p>Vous pouvez récupérer ce planning ultérieurement avec cette clef :
          <span>{getKeyStore()}</span>
        </p>
      </section>
      <section className="modal-card-foot footer-show-key">
        <button className="button is-success" onClick={closeModal}>Ok !</button>
      </section>
      <button className="modal-close is-large" onClick={closeModal} />
    </div>
  </div>
);

export default ModalShowKey;

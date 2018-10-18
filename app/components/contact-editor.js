import { none } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  storeModel: null,
  model: null,
  isNew: none('storeModel'),

  init() {
    this._super(...arguments);

    this.forkedStore = this.get('store').fork();

    if (this.get('isNew')) {
      this.forkedStore.addRecord({type: 'contact'})
        .then(contact => this.set('model', contact));

    } else {
      let storeModel = this.get('storeModel');
      let model = this.forkedStore.cache.findRecord(storeModel.type, storeModel.id);
      this.set('model', model);
    }
  },

  didInsertElement() {
    this.element.querySelector('input').focus();
  },

  willDestroy() {
    this._super(...arguments);
    if (this.forkedStore) {
      this.forkedStore.destroy();
    }
  },

  actions: {
    addPhoneNumber() {
      this.forkedStore
        .addRecord({type: 'phoneNumber'})
        .then((phoneNumber) => {
          this.get('model.phoneNumbers').pushObject(phoneNumber);
          window.requestAnimationFrame(() => {
            let inputs = this.element.querySelectorAll('input.phone-number');
            inputs[inputs.length - 1].focus();
          });
        });
    },

    removePhoneNumber(phoneNumber) {
      this.get('model.phoneNumbers')
        .removeObject(phoneNumber)
        .then(() => phoneNumber.remove());
    },

    save() {
      this.get('store')
        .merge(this.forkedStore, { transformOptions: { label: 'Save contact' }})
        .then(() => {
          let model = this.get('model');
          let storeModel = this.get('store').cache.findRecord(model.type, model.id, { label: 'Find contact' });
          this.sendAction('success', storeModel);
        })
        .catch(() => {
          // Note: Remote errors will only be caught here with a pessimistic update strategy.
          // In the optimistic case, remote errors will occur after the local update has
          // succeeded.
          alert('Contact could not be saved');
        });
    },

    cancel() {
      this.sendAction('cancel');
    }
  }
});

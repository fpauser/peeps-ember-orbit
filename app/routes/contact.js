import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    try {
      return this.store.cache.findRecord('contact', params.contact_id, { label: 'Find contact' })
    } catch(e) {
      console.error('Error finding record in store', e);
      this.transitionTo('contacts.index');
    }
  },

  afterModel(model) {
    this.transitionTo('contact.index', model);
  }
});

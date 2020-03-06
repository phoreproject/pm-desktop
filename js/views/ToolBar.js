import BaseVw from './baseVw';
import loadTemplate from '../utils/loadTemplate';
import UnlockBtn from './modals/wallet/UnlockBtn';
import $ from 'jquery';
import { getWallet } from '../utils/modalManager';
import { openSimpleMessage } from './modals/SimpleMessage';
import app from '../app';

export default class extends BaseVw {

  constructor(options = {}) {
    const opts = {
      ...options,
      initialState: {
        unlockBtnVisible: false,
        ...options.initialState || {},
      },
    };

    super(opts);
    this.options = opts;

    this.unlockBtn = this.createChild(UnlockBtn);
    this.boundOnDocClick = this.documentClick.bind(this);
    $(document).on('click', this.boundOnDocClick);
    this.wallet = null;
  }

  events() {
    return {
      'click .js-lockWallet': 'onLockClick',
      'click .js-unlockWallet': 'onUnlockClick',
    };
  }

  documentClick(e) {
    const unlockBtn = this.getCachedEl('.js-unlockBtnPlaceholder')[0];
    const unlockWallet = this.getCachedEl('.js-unlockWallet')[0];

    if (this.unlockBtn && this.unlockBtn.getState().unlockBtnVisible &&
      !$.contains(unlockBtn, e.target) && unlockBtn !== e.target &&
      !$.contains(unlockWallet, e.target) && unlockWallet !== e.target) {
      this.unlockBtn.setState({ unlockBtnVisible: false });
    }
  }

  prepareWallet() {
    if (this.wallet == null) {
      this.wallet = getWallet();

      this.listenTo(this.wallet, 'lockStatusChanged', (status) => {
        this.setState({ walletLocked: status });
      });
    }
  }

  onLockClick() {
    this.prepareWallet();

    this.wallet.lockWallet()
      .done(data => {
        if (data.isLocked !== 'true') {
          openSimpleMessage(app.polyglot.t('wallet.manage.unlockFailedDialogTitle'),
            app.polyglot.t('wallet.manage.stateChangeFailedUnknownReason'));
        }
      })
      .fail(xhr => {
        openSimpleMessage(app.polyglot.t('wallet.manage.unlockFailedDialogTitle'),
          xhr && xhr.responseJSON && xhr.responseJSON.reason || '');
      });
  }

  onUnlockClick() {
    this.prepareWallet();
    this.unlockBtn.setState({ unlockBtnVisible: true });
  }

  render() {
    const state = this.getState();

    loadTemplate('toolBar.html', (t) => {
      this.$el.html(t({
        walletLocked: state.walletLocked,
      }));

      this.unlockBtn.delegateEvents();
      this.$('.js-unlockBtnPlaceholder')
        .append(this.unlockBtn.render().el);
    });

    return super.render();
  }
}

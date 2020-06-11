import $ from 'jquery';
import baseVw from '../../baseVw';
import loadTemplate from '../../../utils/loadTemplate';

import {
  isBulkTermsUpdating,
  events as bulkTermsUpdateEvents,
} from '../../../utils/bulkTermsUpdate';

export default class extends baseVw {
  constructor(options = {}) {
    const opts = {
      ...options,
      className: 'bulkCoinUpdateBtn flex gutterH',
      initialState: {
        isBulkTermsUpdating: isBulkTermsUpdating(),
        error: '',
        ...options.initialState,
      },
    };
    super(opts);

    this.listenTo(bulkTermsUpdateEvents, 'bulkTermsUpdateDone bulkTermsUpdateFailed',
      () => this.setState({ isBulkTermsUpdating: false }));

    this.boundOnDocClick = this.onDocumentClick.bind(this);
    $(document).on('click', this.boundOnDocClick);
  }

  events() {
    return {
      'click .js-applyToCurrent': 'clickApplyToCurrent',
      'click .js-applyToCurrentCancel': 'clickApplyToCurrentCancel',
      'click .js-applyToCurrentConfirm': 'clickApplyToCurrentConfirm',
    };
  }

  startProcessingTimer() {
    if (!this.processingTimer) {
      this.processingTimer = setTimeout(() => {
        this.processingTimer = null;
        // If the update is still pending, let it set the isBulkTermsUpdating state.
        if (!isBulkTermsUpdating()) this.setState({ isBulkTermsUpdating: false });
      }, 500);
    }
  }

  setState(state = {}, options = {}) {
    // When the state is set to processing, start a timer so it's visible even if it's very short.
    if (state.isBulkTermsUpdating) this.startProcessingTimer();

    // If the state is set to stop processing, let the timer finish.
    if (state.hasOwnProperty('isBulkTermsUpdating') &&
      !state.isBulkTermsUpdating &&
      this.processingTimer) {
      delete state.isBulkTermsUpdating;
    }

    super.setState(state, options);
  }

  clickApplyToCurrent() {
    this.setState({ showConfirmTooltip: true });
    return false;
  }

  clickApplyToCurrentCancel() {
    this.setState({ showConfirmTooltip: false });
    return false;
  }

  clickApplyToCurrentConfirm() {
    this.trigger('bulkTermsUpdateConfirm');
    return false;
  }

  onDocumentClick(e) {
    if (this.getState().showConfirmTooltip &&
      !$(e.target).hasClass('js-confirmBox') &&
      !($.contains(this.getCachedEl('.js-confirmBox')[0], e.target))) {
      this.setState({ showConfirmTooltip: false });
    }
  }


  remove() {
    $(document).off('click', this.boundOnDocClick);
    clearTimeout(this.processingTimer);
    super.remove();
  }

  render() {
    super.render();

    loadTemplate('modals/settings/bulkTermsUpdateBtn.html', (t) => {
      this.$el.html(t({
        ...this.getState(),
      }));
    });

    return this;
  }
}

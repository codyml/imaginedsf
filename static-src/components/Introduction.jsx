/*
* Imports libraries.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


/*
* Imports action creators.
*/

import * as actions from '../state/actions';


class Introduction extends React.Component {
  componentDidMount() {
    const { contentRequested, contentReceived } = this.props;
    contentRequested(['introduction']);
    setTimeout(() => {
      contentReceived(
        ['introduction'],
        'a sample introduction',
      );
    }, 5000);
  }

  render() {
    const { contentAreaLoading, contentAreaContent } = this.props;
    return (
      <div>
        Introduction Component
        { contentAreaLoading ? 'Content loading' : 'Content not loading' }
        { contentAreaContent.toString() }
      </div>
    );
  }
}

Introduction.propTypes = {
  contentRequested: PropTypes.func.isRequired,
  contentReceived: PropTypes.func.isRequired,
  contentAreaLoading: PropTypes.bool.isRequired,
  contentAreaContent: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = ({
  contentAreaLoading,
  contentAreaContent,
}) => ({
  contentAreaLoading,
  contentAreaContent,
});

const mapDispatchToProps = {
  contentRequested: actions.contentRequested,
  contentReceived: actions.contentReceived,
};

export default connect(mapStateToProps, mapDispatchToProps)(Introduction);

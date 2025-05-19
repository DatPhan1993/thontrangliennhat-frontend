import React from 'react';
import PropTypes from 'prop-types';

const NothingLayout = ({ children }) => {
    return <>{children}</>;
};

NothingLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default NothingLayout; 
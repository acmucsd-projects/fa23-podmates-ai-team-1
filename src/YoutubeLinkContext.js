import React, { createContext} from 'react';
import PropTypes from 'prop-types';
export const YoutubeLinkContext = createContext();

export const YoutubeLinkProvider = ({ children, value }) => {
    return (
        <YoutubeLinkContext.Provider value={value}>
            {children}
        </YoutubeLinkContext.Provider>
    );
};
YoutubeLinkProvider.propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired
};
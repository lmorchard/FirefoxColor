import React from 'react';
import { connect } from 'react-redux';

import { actions, selectors } from '../../../../lib/store';

import AppBackground from '../AppBackground';
import BrowserPreview from '../BrowserPreview';
import ThemeColorsEditor from '../ThemeColorsEditor';
import PresetThemeSelector from '../PresetThemeSelector';
import ThemeBackgroundPicker from '../ThemeBackgroundPicker';
import ExtensionInstallButton from '../ExtensionInstallButton';
import SharedThemeDialog from '../SharedThemeDialog';
import AppLoadingIndicator from '../AppLoadingIndicator';
import ThemeUrl from '../ThemeUrl';

import './index.scss';

const mapStateToProps = state => ({
  theme: selectors.theme(state),
  themeCanUndo: selectors.themeCanUndo(state),
  themeCanRedo: selectors.themeCanRedo(state),
  hasExtension: selectors.hasExtension(state),
  loaderDelayExpired: selectors.loaderDelayExpired(state),
  selectedColor: selectors.selectedColor(state),
  shouldOfferPendingTheme: selectors.shouldOfferPendingTheme(state),
  pendingTheme: selectors.pendingTheme(state)
});

const mapDispatchToProps = dispatch => ({
  setBackground: args => dispatch(actions.theme.setBackground(args)),
  setColor: args => dispatch(actions.theme.setColor(args)),
  setTheme: args => dispatch({
    ...actions.theme.setTheme(args),
    meta: { userEdit: true }
  }),
  clearPendingTheme: () => dispatch(actions.ui.clearPendingTheme()),
  setSelectedColor: args => dispatch(actions.ui.setSelectedColor(args)),
  undo: () => dispatch(actions.theme.undo()),
  redo: () => dispatch(actions.theme.redo())
});

export const AppComponent = ({
  addonUrl,
  urlEncodeTheme,
  clipboard,
  theme,
  themeCanUndo,
  themeCanRedo,
  hasExtension,
  loaderDelayExpired,
  selectedColor,
  setColor,
  pendingTheme,
  shouldOfferPendingTheme,
  clearPendingTheme,
  setTheme,
  setSelectedColor,
  setBackground,
  undo,
  redo
}) =>
  <div className="app">
    {!loaderDelayExpired && <AppLoadingIndicator />}
    {hasExtension && shouldOfferPendingTheme &&
      <SharedThemeDialog {...{ pendingTheme, setTheme, clearPendingTheme }} />}
    <AppBackground {...{ theme }} />
    {!hasExtension && <ExtensionInstallButton {...{ addonUrl }} />}
    <div className="app-content">
      <header>
        <h1>THEMEZ𝕽FUN!</h1>
        <p>A Firefox Test Pilot experiment</p>
      </header>
      <BrowserPreview {...{ theme, setSelectedColor, size: 'large' }}>
        <ThemeUrl {...{ theme, urlEncodeTheme, clipboard }} />
      </BrowserPreview>
      <ThemeColorsEditor {...{
        theme,
        selectedColor,
        setColor,
        setSelectedColor,
        undo,
        redo,
        themeCanUndo,
        themeCanRedo
      }} />
      <PresetThemeSelector {...{ setTheme }}/>
      <ThemeBackgroundPicker {...{ theme, setBackground }} />
    </div>
  </div>;

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);

import React from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import {
  SortableContainer,
  SortableElement,
  SortableHandle
} from "react-sortable-hoc";
import {
  CUSTOM_BACKGROUND_MAXIMUM_SIZE,
  CUSTOM_BACKGROUND_ALLOWED_TYPES
} from "../../../../lib/constants";

import "./index.scss";

import iconHAlignLeft from "./icon_align_left.svg";
import iconVAlignCenter from "./icon_align_center.svg";

import iconLoading from "./icon_loading.svg";
import iconInfo from "../../../../images/info-16.svg";

export class ThemeCustomBackgroundPicker extends React.Component {
  constructor(props) {
    super(props);
  }

  handleImageAdd = ({ name }) => {
    this.props.addCustomBackground({
      name,
      tiling: "no-repeat",
      alignment: "left top"
    });
  };

  handleShouldCancelStart = e => {
    // Cancel sorting if there's only one background
    if (this.props.themeCustomBackgrounds.length <= 1) {
      return true;
    }

    // Copy default behavior: https://github.com/clauderic/react-sortable-hoc/blob/master/src/SortableContainer/index.js#L51
    // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
    const disabledElements = ["input", "textarea", "select", "option", "button"];

    if (disabledElements.includes(e.target.tagName.toLowerCase())) {
      return true; // Return true to cancel sorting
    }

    return false;
  }

  // HACK: Prevent default on drag to stop text highlighting
  // https://github.com/clauderic/react-sortable-hoc/issues/253#issuecomment-350223723
  handleSortStart = (_, event) => {
    event.preventDefault();
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    this.props.moveCustomBackground({ oldIndex, newIndex });
  };

  render() {
    const { addImage, updateImage } = this.props;
    return (
      <form className="custom-background" onSubmit={e => e.preventDefault()}>
        <label htmlFor="customBackground">
          <h2>Custom background image</h2>
        </label>

        <ImageImporter
          {...{ addImage, updateImage, onImport: this.handleImageAdd }}
        >
          {({ importing, errors, ImportButton }) => (
            <div className="add-image">
              <ImportButton label="Upload image" />
              {importing && (
                <img className="status-icon importing" src={iconLoading} />
              )}
              {errors && (
                <React.Fragment>
                  <img
                    className="status-icon errors"
                    src={iconInfo}
                    title={JSON.stringify(errors)}
                  />
                  <Modal>
                    <ul className="errors">
                      {errors.tooLarge && (
                        <li>The image is too large. (1MB maximum size)</li>
                      )}
                      {errors.wrongType && (
                        <li>The file is not an accepted image type.</li>
                      )}
                    </ul>
                  </Modal>
                </React.Fragment>
              )}
            </div>
          )}
        </ImageImporter>

        <BackgroundList
          {...this.props}
          helperClass="dragHelper"
          useDragHandle={true}
          shouldCancelStart={this.handleShouldCancelStart}
          onSortStart={this.handleSortStart}
          onSortEnd={this.handleSortEnd}
        />
      </form>
    );
  }
}

const modalRoot = document.getElementById("modal");

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement("div");
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
    setTimeout(() => this.el.classList.add("fade-in"), 10);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return createPortal(this.props.children, this.el);
  }
}

const BackgroundList = SortableContainer(props => {
  const {
    clearCustomBackground,
    updateCustomBackground,
    themeCustomBackgrounds,
    themeCustomImages
  } = props;
  return (
    <ul className="backgroundList">
      {themeCustomBackgrounds.map((item, index) => (
        <SortableThemeCustomBackgroundSelector
          key={index}
          {...{
            ...props,
            item,
            index,
            image: themeCustomImages[item.name],
            clearCustomBackground: (args = {}) =>
              clearCustomBackground({ index, ...args }),
            updateCustomBackground: (args = {}) =>
              updateCustomBackground({ index, ...args })
          }}
        />
      ))}
    </ul>
  );
});

const DragHandle = SortableHandle(({ icon = "importing", errors }) => (
  <span
    className={classNames("drag-handle", "status-icon", icon)}
    title={!errors ? "" : JSON.stringify(errors)}
  >
    &nbsp;
  </span>
));

class ThemeCustomBackgroundSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleClearBackground, handleTilingChange } = this;
    const { addImage, updateImage, image } = this.props;
    const { tiling, alignment = "left top" } = this.props.item;
    const [horizontalAlign, verticalAlign] = alignment.split(" ");
    const alignmentState = { horizontalAlign, verticalAlign };

    const AlignButton = ({ alignment, isHorizontal = false }) => {
      const alignmentKey = isHorizontal ? "horizontalAlign" : "verticalAlign";
      const isCenter = alignment === "center";
      const icon = isCenter ? iconVAlignCenter : iconHAlignLeft;
      const newAlignmentState = { [alignmentKey]: alignment };
      return (
        <button
          onClick={() => this.setAlignmentState(newAlignmentState)}
          className={classNames(
            { selected: alignmentState[alignmentKey] === alignment },
            "align-button",
            `align-button-${
              isHorizontal ? "horizontal" : "vertical"
            }-${alignment}`
          )}
        >
          <img src={icon} width="13" height="16" />
        </button>
      );
    };

    return (
      <ImageImporter
        {...{ image, addImage, updateImage, onImport: this.handleImageImport }}
      >
        {({ importing, errors, ImportButton }) => {
          let statusIcon;
          if (errors) {
            statusIcon = "error";
          } else if (importing) {
            statusIcon = "importing";
          } else {
            statusIcon = "draggable";
          }
          return (
            <li className={classNames("customBackgroundItem", { importing })}>
              <DragHandle errors={errors} icon={statusIcon} />

              {errors && (
                <Modal>
                  <ul className="errors">
                    {errors.tooLarge && (
                      <li>The image is too large. (1MB maximum size)</li>
                    )}
                    {errors.wrongType && (
                      <li>The file is not an accepted image type.</li>
                    )}
                  </ul>
                </Modal>
              )}

              {image && (
                <div className="image-preview">
                  <img src={image.image} height="34" />
                  <span className="name">{image.name}</span>
                </div>
              )}

              <div className="align-group">
                {["left", "center", "right"].map((alignment, idx) => (
                  <AlignButton
                    key={idx}
                    {...{ alignment, isHorizontal: true }}
                  />
                ))}
              </div>

              <div className="align-group">
                {["top", "center", "bottom"].map((alignment, idx) => (
                  <AlignButton key={idx} {...{ alignment }} />
                ))}
              </div>

              <select
                className="tiling"
                value={tiling}
                onChange={handleTilingChange}
              >
                <option value="repeat">Repeat both ways</option>
                <option value="repeat-x">Repeat horizontally</option>
                <option value="repeat-y">Repeat vertically</option>
                <option value="no-repeat">No repeat</option>
              </select>

              <ImportButton label={errors ? "Retry" : "Replace image"} />

              <button className="clear" onClick={handleClearBackground}>
                &#x2716;
              </button>
            </li>
          );
        }}
      </ImageImporter>
    );
  }

  handleClearBackground = () => {
    this.props.clearCustomBackground();
  };

  handleTilingChange = ev => {
    this.props.updateCustomBackground({ tiling: ev.target.value });
  };

  handleImageImport = ({ name }) => {
    this.props.updateCustomBackground({ name });
  };

  setAlignmentState(state) {
    const { item, updateCustomBackground } = this.props;

    // HACK: This allows the alignment buttons to partially update the space
    // separated alignment value as if has horizontalAlign and verticalAlign
    // properties. Should probably live in the add-on or store.
    const { alignment = "left top" } = item;
    const [horizontalAlign = "left", verticalAlign = "top"] = alignment.split(
      " "
    );
    const alignmentState = { horizontalAlign, verticalAlign, ...state };
    const newAlignment = `${alignmentState.horizontalAlign} ${
      alignmentState.verticalAlign
    }`;

    updateCustomBackground({ alignment: newAlignment });
  }
}

const SortableThemeCustomBackgroundSelector = SortableElement(
  ThemeCustomBackgroundSelector
);

class ImageImporter extends React.Component {
  constructor(props) {
    super(props);
    this.fileInputEl = null;
  }

  state = {
    importing: false,
    error: false,
    tooLarge: false,
    wrongType: false
  };

  render() {
    const { handleFileChoice } = this;
    const { importing, error, tooLarge, wrongType } = this.state;

    return this.props.children({
      importing,
      errors: !error ? false : { tooLarge, wrongType },
      ImportButton: ({ label }) => (
        <React.Fragment>
          <input
            className="inputfile"
            type="file"
            ref={el => (this.fileInputEl = el)}
            onChange={handleFileChoice}
          />
          <button
            className="import-image"
            onClick={() => this.fileInputEl.click()}
          >
            {label}
          </button>
        </React.Fragment>
      )
    });
  }

  handleFileChoice = ev => {
    const { addImage, updateImage, onImport } = this.props;

    const file = ev.target.files[0];

    const errorState = {
      tooLarge: file.size > CUSTOM_BACKGROUND_MAXIMUM_SIZE,
      wrongType: !CUSTOM_BACKGROUND_ALLOWED_TYPES.includes(file.type)
    };
    errorState.error = Object.values(errorState).filter(v => v).length > 0;
    this.setState(errorState);
    if (errorState.error) {
      return;
    }

    this.setState({ importing: true });
    const { name, size, type } = file;
    addImage({ name, size, type });

    const reader = new FileReader();
    reader.onload = ev => {
      this.setState({ importing: false });
      updateImage({ name, image: ev.target.result });
      onImport(file);
    };
    reader.readAsDataURL(file);
  };
}

export default ThemeCustomBackgroundPicker;

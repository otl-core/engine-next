import { FormButtonBlock } from "./form-button";
import { FormButtonGroupBlock } from "./form-button-group";
import { FormCheckboxBlock } from "./form-checkbox";
import { FormInlineGroupBlock } from "./form-inline-group";
import { FormInputBlock } from "./form-input";
import { FormRadioBlock } from "./form-radio";
import { FormRangeBlock } from "./form-range";
import { FormRatingBlock } from "./form-rating";
import { FormSelectBlock } from "./form-select";
import { FormSliderBlock } from "./form-slider";
type BlockComponent = React.ComponentType<{
  blockId: string;
  siteId?: string;
}>;

export const formBlockComponents: Record<string, BlockComponent> = {
  "form-input": FormInputBlock,
  "form-checkbox": FormCheckboxBlock,
  "form-radio": FormRadioBlock,
  "form-select": FormSelectBlock,
  "form-button-group": FormButtonGroupBlock,
  "form-slider": FormSliderBlock,
  "form-range": FormRangeBlock,
  "form-rating": FormRatingBlock,
  "form-button": FormButtonBlock,
  "form-inline-group": FormInlineGroupBlock,
};

export {
  FormButtonBlock,
  FormButtonGroupBlock,
  FormCheckboxBlock,
  FormInlineGroupBlock,
  FormInputBlock,
  FormRadioBlock,
  FormRangeBlock,
  FormRatingBlock,
  FormSelectBlock,
  FormSliderBlock,
};

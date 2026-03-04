import { FormButtonBlock } from "./form-button";
import { FormCheckboxBlock } from "./form-checkbox";
import { FormInlineGroupBlock } from "./form-inline-group";
import { FormInputBlock } from "./form-input";
import { FormRadioBlock } from "./form-radio";
import { FormSelectBlock } from "./form-select";
import { FormSliderBlock } from "./form-slider";
import { FormToggleGroupBlock } from "./form-toggle-group";

type BlockComponent = React.ComponentType<{
  blockId: string;
  siteId?: string;
}>;

export const formBlockComponents: Record<string, BlockComponent> = {
  "form-input": FormInputBlock,
  "form-checkbox": FormCheckboxBlock,
  "form-radio": FormRadioBlock,
  "form-select": FormSelectBlock,
  "form-toggle-group": FormToggleGroupBlock,
  "form-slider": FormSliderBlock,
  "form-button": FormButtonBlock,
  "form-inline-group": FormInlineGroupBlock,
};

export {
  FormButtonBlock,
  FormCheckboxBlock,
  FormInlineGroupBlock,
  FormInputBlock,
  FormRadioBlock,
  FormSelectBlock,
  FormSliderBlock,
  FormToggleGroupBlock,
};

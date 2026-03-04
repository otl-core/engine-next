/**
 * Animation Utilities
 * CSS keyframe and transition generators for navigation and footer components.
 */

/**
 * Generate CSS keyframe animations for toggle icons (hamburger, kebab, meatball, grid)
 */
export function generateToggleIconAnimations(): string[] {
  return [
    `@keyframes hamburger-top-open{0%{top:25%;transform:translateY(-50%) rotate(0deg)}50%{top:50%;transform:translateY(-50%) rotate(0deg)}100%{top:50%;transform:translateY(-50%) rotate(-45deg)}}`,
    `@keyframes hamburger-top-close{0%{top:50%;transform:translateY(-50%) rotate(-45deg)}50%{top:50%;transform:translateY(-50%) rotate(0deg)}100%{top:25%;transform:translateY(-50%) rotate(0deg)}}`,
    `@keyframes hamburger-bottom-open{0%{top:75%;transform:translateY(-50%) rotate(0deg)}50%{top:50%;transform:translateY(-50%) rotate(0deg)}100%{top:50%;transform:translateY(-50%) rotate(45deg)}}`,
    `@keyframes hamburger-bottom-close{0%{top:50%;transform:translateY(-50%) rotate(45deg)}50%{top:50%;transform:translateY(-50%) rotate(0deg)}100%{top:75%;transform:translateY(-50%) rotate(0deg)}}`,
    `@keyframes hamburger-middle-hide{0%{opacity:1}50%{opacity:1}50.01%{opacity:0}100%{opacity:0}}`,
    `@keyframes hamburger-middle-show{0%{opacity:0}49.99%{opacity:0}50%{opacity:1}100%{opacity:1}}`,
    `@keyframes kebab-top-open{0%{top:25%;width:var(--dot-width);transform:translate(-50%,-50%) rotate(0deg)}50%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(-45deg)}}`,
    `@keyframes kebab-top-close{0%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(-45deg)}50%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{top:25%;width:var(--dot-width);transform:translate(-50%,-50%) rotate(0deg)}}`,
    `@keyframes kebab-bottom-open{0%{top:75%;width:var(--dot-width);transform:translate(-50%,-50%) rotate(0deg)}50%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(45deg)}}`,
    `@keyframes kebab-bottom-close{0%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(45deg)}50%{top:50%;width:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{top:75%;width:var(--dot-width);transform:translate(-50%,-50%) rotate(0deg)}}`,
    `@keyframes kebab-middle-hide{0%{opacity:1}50%{opacity:1}50.01%{opacity:0}100%{opacity:0}}`,
    `@keyframes kebab-middle-show{0%{opacity:0}49.99%{opacity:0}50%{opacity:1}100%{opacity:1}}`,
    `@keyframes meatballs-left-open{0%{left:25%;height:var(--dot-height);transform:translate(-50%,-50%) rotate(0deg)}50%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(45deg)}}`,
    `@keyframes meatballs-left-close{0%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(45deg)}50%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:25%;height:var(--dot-height);transform:translate(-50%,-50%) rotate(0deg)}}`,
    `@keyframes meatballs-right-open{0%{left:75%;height:var(--dot-height);transform:translate(-50%,-50%) rotate(0deg)}50%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(-45deg)}}`,
    `@keyframes meatballs-right-close{0%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(-45deg)}50%{left:50%;height:100%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:75%;height:var(--dot-height);transform:translate(-50%,-50%) rotate(0deg)}}`,
    `@keyframes meatballs-middle-hide{0%{opacity:1}50%{opacity:1}50.01%{opacity:0}100%{opacity:0}}`,
    `@keyframes meatballs-middle-show{0%{opacity:0}49.99%{opacity:0}50%{opacity:1}100%{opacity:1}}`,
    `@keyframes grid-tl-open{0%{left:25%;top:25%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}33%{left:50%;top:50%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}66%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(-45deg)}}`,
    `@keyframes grid-tl-close{0%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(-45deg)}33%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(0deg)}66%{left:50%;top:50%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}100%{left:25%;top:25%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}}`,
    `@keyframes grid-tr-hide{0%{left:75%;top:25%;opacity:1;transform:translate(-50%,-50%)}33%{left:50%;top:50%;opacity:1;transform:translate(-50%,-50%)}33.01%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}100%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}}`,
    `@keyframes grid-tr-show{0%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}66.99%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}67%{left:75%;top:25%;opacity:1;transform:translate(-50%,-50%)}100%{left:75%;top:25%;opacity:1;transform:translate(-50%,-50%)}}`,
    `@keyframes grid-bl-hide{0%{left:25%;top:75%;opacity:1;transform:translate(-50%,-50%)}33%{left:50%;top:50%;opacity:1;transform:translate(-50%,-50%)}33.01%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}100%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}}`,
    `@keyframes grid-bl-show{0%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}66.99%{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%)}67%{left:25%;top:75%;opacity:1;transform:translate(-50%,-50%)}100%{left:25%;top:75%;opacity:1;transform:translate(-50%,-50%)}}`,
    `@keyframes grid-br-open{0%{left:75%;top:75%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}33%{left:50%;top:50%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}66%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(0deg)}100%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(45deg)}}`,
    `@keyframes grid-br-close{0%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(45deg)}33%{left:50%;top:50%;width:100%;height:12.5%;transform:translate(-50%,-50%) rotate(0deg)}66%{left:50%;top:50%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}100%{left:75%;top:75%;width:var(--square-size);height:var(--square-size);transform:translate(-50%,-50%) rotate(0deg)}}`,
  ];
}

/**
 * Generate CSS transitions for mobile menu open/close
 */
export function generateMobileMenuAnimations(): string[] {
  return [
    `.mobile-menu-enter{max-height:0;opacity:0}`,
    `.mobile-menu-enter-active{max-height:500px;opacity:1;transition:max-height 300ms ease-in-out,opacity 300ms ease-in-out}`,
    `.mobile-menu-exit{max-height:500px;opacity:1}`,
    `.mobile-menu-exit-active{max-height:0;opacity:0;transition:max-height 300ms ease-in-out,opacity 300ms ease-in-out}`,
  ];
}

/**
 * Generate CSS transitions for desktop dropdown open/close
 */
export function generateDesktopDropdownAnimations(): string[] {
  return [
    `.desktop-dropdown-enter{opacity:0;transform:translateY(-8px)}`,
    `.desktop-dropdown-enter-active{opacity:1;transform:translateY(0);transition:opacity 200ms ease-out,transform 200ms ease-out}`,
    `.desktop-dropdown-exit{opacity:1;transform:translateY(0)}`,
    `.desktop-dropdown-exit-active{opacity:0;transform:translateY(-8px);transition:opacity 200ms ease-in,transform 200ms ease-in}`,
  ];
}

/**
 * Generate CSS for custom scrollbar styling on mobile dropdowns
 */
export function generateScrollbarStyles(): string[] {
  return [
    `.mobile-dropdown-nav{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.2) transparent}`,
    `.mobile-dropdown-nav::-webkit-scrollbar{width:0.5rem}`,
    `.mobile-dropdown-nav::-webkit-scrollbar-track{background:transparent}`,
    `.mobile-dropdown-nav::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:0.25rem}`,
    `.mobile-dropdown-nav::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.3)}`,
    `@media(prefers-color-scheme:dark){.mobile-dropdown-nav{scrollbar-color:rgba(255,255,255,0.2) transparent}.mobile-dropdown-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2)}.mobile-dropdown-nav::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.3)}}`,
  ];
}

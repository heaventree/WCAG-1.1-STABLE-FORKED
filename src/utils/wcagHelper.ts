interface WCAGInfo {
  description: string;
  successCriteria: string;
  suggestedFix: string;
  codeExample?: string;
}

const ruleToWCAGMap: Record<string, string[]> = {
  'landmark-no-duplicate-banner': ['WCAG1.3.1', 'WCAG4.1.1'],
  'landmark-no-duplicate-contentinfo': ['WCAG1.3.1', 'WCAG4.1.1'],
  'landmark-banner-is-top-level': ['WCAG1.3.1'],
  'landmark-contentinfo-is-top-level': ['WCAG1.3.1'],
  'landmark-complementary-is-top-level': ['WCAG1.3.1'],
  'landmark-unique': ['WCAG1.3.1', 'WCAG4.1.1'],
  'landmark-no-duplicate-main': ['WCAG1.3.1', 'WCAG4.1.1'],
  'button-name': ['WCAG4.1.2', 'WCAG2.5.3'],
  'image-alt': ['WCAG1.1.1'],
  'image-redundant-alt': ['WCAG1.1.1'],
  'link-name': ['WCAG2.4.4', 'WCAG4.1.2'],
  'color-contrast': ['WCAG1.4.3'],
  'region': ['WCAG1.3.1'],
  'list': ['WCAG1.3.1'],
  'listitem': ['WCAG1.3.1'],
  'heading-order': ['WCAG1.3.1', 'WCAG2.4.6'],
  'label': ['WCAG1.3.1', 'WCAG4.1.2'],
  'label-title-only': ['WCAG1.3.1', 'WCAG4.1.2'],
  'frame-title': ['WCAG4.1.2'],
  'html-has-lang': ['WCAG3.1.1'],
  'document-title': ['WCAG2.4.2'],
  'object-alt': ['WCAG1.1.1'],
  'duplicate-id-aria': ['WCAG4.1.1']
};

const wcagDatabase: Record<string, WCAGInfo> = {
  'image-redundant-alt': {
    description: 'Alternative text should not be repeated as visible text to avoid redundancy for screen reader users.',
    successCriteria: 'Ensure that image alternative text does not duplicate adjacent or contained text content.',
    suggestedFix: 'Remove redundant alternative text when the image\'s meaning is already conveyed by nearby text content.',
    codeExample: `<!-- Bad Example -->
<img src="phone.png" alt="Contact us at 555-0123">
<p>Contact us at 555-0123</p>

<!-- Good Example -->
<img src="phone.png" alt="Phone icon">
<p>Contact us at 555-0123</p>

<!-- Or, if the image is decorative -->
<img src="phone.png" alt="" role="presentation">
<p>Contact us at 555-0123</p>`
  },
  'link-name': {
    description: 'Links must have discernible text that clearly indicates their purpose.',
    successCriteria: 'Ensure that the purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined context.',
    suggestedFix: 'Provide descriptive text for links that clearly indicates their purpose. Avoid generic phrases like "click here" or "learn more" without context.',
    codeExample: `<!-- Bad Examples -->
<a href="doc.pdf">click here</a>
<a href="help.html">read more</a>
<a href="profile.html"><img src="user.png"></a>

<!-- Good Examples -->
<a href="doc.pdf">Download Annual Report (PDF)</a>
<a href="help.html">Learn more about accessibility features</a>
<a href="profile.html">
  <img src="user.png" alt="View user profile">
</a>`
  },
  'landmark-no-duplicate-main': {
    description: 'A page must not have more than one main landmark. The main landmark represents the primary content of the page.',
    successCriteria: 'Ensure there is exactly one main landmark per page to clearly identify the primary content area.',
    suggestedFix: 'Keep only one main landmark and use other appropriate landmarks or elements for additional content sections.',
    codeExample: `<!-- Good Example -->
<header role="banner">
  <!-- Header content -->
</header>
<main role="main">
  <!-- Primary content -->
</main>
<footer role="contentinfo">
  <!-- Footer content -->
</footer>

<!-- Bad Example -->
<main role="main">
  <!-- First main content -->
</main>
<main role="main">
  <!-- Second main content - This is incorrect -->
</main>`
  },
  'duplicate-id-aria': {
    description: 'IDs used in ARIA and labels must be unique to prevent confusion for assistive technologies.',
    successCriteria: 'Ensure that all id attributes are unique within the document to maintain proper relationships between labels and their controls.',
    suggestedFix: 'Generate unique IDs for all elements that require them. If using dynamic content, ensure IDs are unique across the entire document.',
    codeExample: `<!-- Bad Example -->
<label id="name">First Name</label>
<input id="name" type="text">
<label id="name">Last Name</label>
<input id="name" type="text">

<!-- Good Example -->
<label id="first-name">First Name</label>
<input id="first-name-input" type="text">
<label id="last-name">Last Name</label>
<input id="last-name-input" type="text">`
  },
  'color-contrast': {
    description: 'Text content must have sufficient contrast against its background to ensure readability.',
    successCriteria: 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
    suggestedFix: 'Adjust text or background colors to meet minimum contrast requirements. Use tools to verify contrast ratios.',
    codeExample: `<!-- Good Example -->
<div style="background-color: #FFFFFF;">
  <p style="color: #595959;">This text has good contrast</p>
</div>

<!-- Bad Example -->
<div style="background-color: #FFFFFF;">
  <p style="color: #CCCCCC;">This text has poor contrast</p>
</div>`
  },
  'heading-order': {
    description: 'Headings must follow a logical hierarchical order to maintain proper document structure.',
    successCriteria: 'Ensure heading levels are properly nested and do not skip levels.',
    suggestedFix: 'Structure headings in a logical order, starting with h1 and nesting subsequent levels appropriately.',
    codeExample: `<!-- Good Example -->
<h1>Main Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection Title</h3>
</section>

<!-- Bad Example -->
<h1>Main Title</h1>
<h3>Skipped h2 Level</h3>`
  },
  'html-has-lang': {
    description: 'The HTML element must have a valid lang attribute to identify the language of the page.',
    successCriteria: 'Specify the primary language of the page using a valid language code.',
    suggestedFix: 'Add a lang attribute with the appropriate language code to the HTML element.',
    codeExample: `<!-- Good Example -->
<!DOCTYPE html>
<html lang="en">
  <head>...</head>
  <body>...</body>
</html>

<!-- Bad Example -->
<!DOCTYPE html>
<html>
  <head>...</head>
  <body>...</body>
</html>`
  },
  'document-title': {
    description: 'The document must have a title that describes its topic or purpose.',
    successCriteria: 'Provide a descriptive title that identifies the page content.',
    suggestedFix: 'Add a meaningful title element that clearly describes the page content.',
    codeExample: `<!-- Good Example -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Product Search Results - Online Store</title>
  </head>
</html>

<!-- Bad Example -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Page Title</title>
  </head>
</html>`
  },
  'image-alt': {
    description: 'Images must have alternative text that describes their content or purpose.',
    successCriteria: 'Provide text alternatives for images that convey their meaning or function.',
    suggestedFix: 'Add descriptive alt text to images. Use empty alt="" for decorative images.',
    codeExample: `<!-- Good Examples -->
<img src="logo.png" alt="Company Logo">
<img src="chart.png" alt="Sales growth chart showing 25% increase">
<img src="decoration.png" alt="" role="presentation">

<!-- Bad Examples -->
<img src="logo.png">
<img src="chart.png" alt="chart">`
  },
  'button-name': {
    description: 'Buttons must have discernible text that describes their purpose.',
    successCriteria: 'Ensure buttons have clear, descriptive labels that indicate their function.',
    suggestedFix: 'Add text content or aria-label to buttons that clearly describes their purpose.',
    codeExample: `<!-- Good Examples -->
<button>Submit Form</button>
<button aria-label="Close dialog">
  <svg><!-- icon --></svg>
</button>

<!-- Bad Examples -->
<button></button>
<button><svg></svg></button>`
  },
  'frame-title': {
    description: 'Frames and iframes must have titles that describe their content.',
    successCriteria: 'Provide descriptive titles for frames to identify their purpose.',
    suggestedFix: 'Add title attributes to frames that clearly describe their content.',
    codeExample: `<!-- Good Example -->
<iframe
  title="Product Demo Video"
  src="video.html"
></iframe>

<!-- Bad Example -->
<iframe src="video.html"></iframe>`
  },
  'list': {
    description: 'List markup must be used correctly to maintain proper structure.',
    successCriteria: 'Use appropriate list elements (ul, ol, dl) to group related items.',
    suggestedFix: 'Structure related items using proper list elements and ensure correct nesting.',
    codeExample: `<!-- Good Example -->
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

<!-- Bad Example -->
<div>
  • First item<br>
  • Second item
</div>`
  },
  'listitem': {
    description: 'List items must be contained within appropriate parent elements.',
    successCriteria: 'Ensure list items are properly nested within list containers.',
    suggestedFix: 'Place list items (li) only within appropriate list elements (ul, ol).',
    codeExample: `<!-- Good Example -->
<ul>
  <li>List item</li>
</ul>

<!-- Bad Example -->
<div>
  <li>Orphaned list item</li>
</div>`
  },
  'region': {
    description: 'All content should be contained within landmarks to aid navigation.',
    successCriteria: 'Use ARIA landmarks or HTML5 sectioning elements to identify page regions.',
    suggestedFix: 'Structure content using appropriate landmark roles or semantic HTML elements.',
    codeExample: `<!-- Good Example -->
<header role="banner">
  <nav role="navigation">...</nav>
</header>
<main role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- Bad Example -->
<div>
  <!-- Unmarked content sections -->
</div>`
  },
  'WCAG1.1.1': {
    description: 'All non-text content must have a text alternative that serves the equivalent purpose.',
    successCriteria: 'Provide text alternatives for any non-text content.',
    suggestedFix: 'Add appropriate text alternatives to images, media, and other non-text content.',
    codeExample: `<!-- Good Examples -->
<img src="chart.png" alt="Q4 sales increased by 25% compared to Q3">
<object data="graph.svg">Annual growth trend showing steady increase</object>`
  },
  'WCAG1.3.1': {
    description: 'Information and relationships conveyed through presentation can be programmatically determined.',
    successCriteria: 'Use semantic markup to convey structure and relationships.',
    suggestedFix: 'Structure content using appropriate HTML elements and ARIA attributes.',
    codeExample: `<!-- Good Example -->
<article>
  <h1>Main Title</h1>
  <section>
    <h2>Section Title</h2>
    <p>Content...</p>
  </section>
</article>`
  },
  'WCAG1.4.3': {
    description: 'Text content must have sufficient contrast with its background.',
    successCriteria: 'Maintain minimum contrast ratios for all text content.',
    suggestedFix: 'Ensure text meets minimum contrast requirements against its background.',
    codeExample: `/* Good Example */
.text {
  color: #333333; /* Dark gray text */
  background-color: #FFFFFF; /* White background */
}`
  },
  'WCAG2.4.2': {
    description: 'Web pages must have titles that describe topic or purpose.',
    successCriteria: 'Provide clear, descriptive page titles.',
    suggestedFix: 'Add meaningful titles that accurately describe page content.',
    codeExample: `<title>Search Results for "Accessibility Tools" - Website Name</title>`
  },
  'WCAG2.4.4': {
    description: 'Link purpose can be determined from link text alone.',
    successCriteria: 'Ensure link text clearly indicates its destination or purpose.',
    suggestedFix: 'Use descriptive link text that makes sense out of context.',
    codeExample: `<!-- Good Example -->
<a href="policy.pdf">Read our privacy policy (PDF)</a>`
  },
  'WCAG2.4.6': {
    description: 'Headings and labels describe topic or purpose.',
    successCriteria: 'Use clear, descriptive headings and labels.',
    suggestedFix: 'Write headings that accurately describe their sections.',
    codeExample: `<h1>Product Features</h1>
<h2>Technical Specifications</h2>`
  },
  'WCAG2.5.3': {
    description: 'Label in name matches visible text.',
    successCriteria: 'Ensure visible labels match their accessible names.',
    suggestedFix: 'Make sure visible text is included in accessible names.',
    codeExample: `<button aria-label="Submit form">Submit</button>`
  },
  'WCAG3.1.1': {
    description: 'Language of page is specified.',
    successCriteria: 'Specify the default human language of the page.',
    suggestedFix: 'Add a lang attribute to the html element.',
    codeExample: `<html lang="en">`
  },
  'WCAG4.1.1': {
    description: 'Elements have complete start and end tags, are nested properly, and have unique IDs.',
    successCriteria: 'Ensure proper HTML structure and unique identification.',
    suggestedFix: 'Use valid HTML markup and maintain unique IDs.',
    codeExample: `<!-- Good Example -->
<div id="unique-1">
  <p>Properly structured content</p>
</div>`
  },
  'WCAG4.1.2': {
    description: 'Name, role, and value can be programmatically determined.',
    successCriteria: 'Ensure interface components are properly identified.',
    suggestedFix: 'Use appropriate ARIA attributes and semantic HTML.',
    codeExample: `<button aria-expanded="false" aria-controls="menu">
  Toggle Menu
</button>`
  }
};

export function getWCAGInfo(ruleId: string | undefined): WCAGInfo | undefined {
  if (!ruleId) return undefined;

  // First check if we have direct rule information
  if (wcagDatabase[ruleId]) {
    return wcagDatabase[ruleId];
  }

  // If not, check the mapping and return the first matching WCAG info
  const wcagCriteria = ruleToWCAGMap[ruleId] || [];
  for (const criteria of wcagCriteria) {
    const info = wcagDatabase[criteria];
    if (info) return info;
  }

  // If no matching info is found, return a default message
  return {
    description: `Accessibility rule '${ruleId}' requires attention to ensure content is accessible to all users.`,
    successCriteria: `Follow WCAG guidelines for ${ruleId} to ensure compliance.`,
    suggestedFix: `Review the specific requirements for ${ruleId} and implement appropriate accessibility fixes.`,
    codeExample: undefined
  };
}
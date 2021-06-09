function updateContext() {  
  const paragraphs = document.getElementsByClassName("paragraph-wrapper")
  const pointer = document.getElementById("pointer");
  var ptrLoc = pointer.getBoundingClientRect().top - pointer.getBoundingClientRect().height/2;
  for (var i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].getBoundingClientRect().top < ptrLoc && 
        paragraphs[i].getBoundingClientRect().bottom > ptrLoc) {
          const ptrTxt = document.getElementById("pointer-context");
          let id = paragraphs[i].id.split('_');
          let sid = id[0].replace('s', '');
          let pid =  id[1].replace('p', '');
          ptrTxt.innerText = `Sect: ${sid} Para: ${pid}`;
          context.sid = parseInt(sid);
          context.pid = parseInt(pid);
    }
  }
}

function clearPaper() {
  const paperContent = document.getElementById("paper-content");
  paperContent.innerHTML = '';
}

function loadPaper() {
  // set title
  const paperContent = document.getElementById("paper-content");
  const paperTitleDiv = document.createElement("div");
  const paperTitle = document.createElement("h1");
  paperTitle.setAttribute("id", "paper-title");
  paperTitle.innerText = data.title;
  paperTitleDiv.append(paperTitle);
  paperContent.append(paperTitleDiv);

  // load contents in paper
  data.sections.forEach((s, i) => {
    const sectionWrapper = document.createElement("div");
    sectionWrapper.setAttribute("class", "section-wrapper");
    const sectionHeading = document.createElement("h2");
    sectionHeading.innerText = s.sectionHeading;
    sectionWrapper.append(sectionHeading);
    s.sectionContent.forEach((p, j) => {
      const paragraphWrapper = document.createElement("div");
      const paragraphText = document.createElement("p");
      if (i in visualMaps) {
        for (var k in visualMaps[i]) {
          if ((j+1) in visualMaps[i][k]) {
            const figure = document.createElement("img");
            const figureDesc = document.createElement("p");
            figure.setAttribute("src", visualMaps[i][k][j+1].src);
            figureDesc.setAttribute("id", `s${i}_p${j+1}_f${visualMaps[i][k][j+1].id}`);
            figureDesc.setAttribute("class", "visual-desc");
            figureDesc.innerText = visualMaps[i][k][j+1].desc;
            paragraphWrapper.append(figure);
            paragraphWrapper.append(figureDesc);
          }
        }
      }
      paragraphWrapper.setAttribute("id", `s${i}_p${j+1}`);
      paragraphWrapper.setAttribute("class", "paragraph-wrapper");
      paragraphText.innerText = p;
      paragraphWrapper.append(paragraphText);
      sectionWrapper.append(paragraphWrapper);
    });
    paperContent.append(sectionWrapper);
  });
}

function toggleList() {
  const autoCard =  document.getElementById("auto-card");
  const modelWrapper = autoCard.querySelector(".model-wrapper");
  const curModel = modelWrapper.querySelector("div");
  const curModelName = curModel.innerText;
  if (isOpen) {
    modelWrapper.innerHTML = '';
    modelWrapper.append(curModel);
    isOpen = false;
  } else {
    for (var i=0; i < modelList.length; i++) {
      if (curModelName != modelList[i]) {
        const newModel = document.createElement("div");
        newModel.innerText = modelList[i];
        newModel.addEventListener("click", (e) => {
          for (var i=0; i < modelList.length; i++) {
            if (newModel.innerText == modelList[i]) {
              sumPara.name = `model${i+1}`;
              break;
            }
          }
          modelWrapper.innerHTML = '';
          isOpen = false;
          newModel.addEventListener("click", (e) => {
            toggleList();
          })
          modelWrapper.append(newModel);
          updateSummary();
        });
        modelWrapper.append(newModel);
      }
    }
    isOpen = true;
  }
}

function initEventListener() {
  document.addEventListener("click", (e) => {
    var target = e.target;
    if (target.className !== "tkn-div" && target.className !== "synonym") {
      const synContainers = document.querySelectorAll(".synonym-container");
      if (typeof synContainers !== "undefined") {
        synContainers.forEach(e => e.remove());      
      }
    }
  });

  const paperWindow = document.getElementById("paper-container");
  paperWindow.addEventListener("scroll", (e) => {
    updateContext();
    updateSummary();
  });

  const autoCard =  document.getElementById("auto-card");
  const lenSlider = autoCard.querySelector(".length-slidebar");
  const modelWrapper = autoCard.querySelector(".model-wrapper");
  lenSlider.addEventListener("change", (e) => {
    if (lenSlider.value == 0) {
      sumPara.length = "short";
    } else if (lenSlider.value == 1) {
      sumPara.length = "medium";
    } else {
      sumPara.length = "long";
    }
    updateSummary();
  });

  const autoEdit = autoCard.querySelector(".edit-btn");
  autoEdit.addEventListener("click", (e) => {
    toggleEditMode();
  });

  const curModel = modelWrapper.querySelector("div");
  curModel.addEventListener("click", (e) => {
    toggleList();
  });

  const popup = document.getElementById("add-popup");
  const addBtn = document.getElementById("add-card-btn");
  const cancelBtn = popup.querySelector(".cancel-btn");
  const confirmBtn = popup.querySelector(".confirm-btn");
  addBtn.addEventListener("click", (e) => {
    addBtn.style.display = "none";
    popup.style.display = "block";
  });  
  cancelBtn.addEventListener("click", (e) => {
    addBtn.style.display = "block";
    popup.style.display = "none";
  });
  confirmBtn.addEventListener("click", (e) => {
    const begin = document.getElementById("begin-input");
    const end = document.getElementById("end-input");
    addBtn.style.display = "block";
    popup.style.display = "none";
    createCard(begin.value, end.value);
    begin.value = "";
    end.value = "";
  });
}

function createCard(start, end) {
  const infoContainer = document.getElementById("info-container");
  const cards = document.getElementsByClassName("card-container");
  const newCard = document.createElement("div");
  let cardNum = cards.length;
  newCard.setAttribute("id", `c${cardNum}`);
  newCard.setAttribute("class", "card-container")
  newCard.innerHTML = cards[0].innerHTML;
  
  // Set contents
  const newTop = newCard.querySelector(".card-top");
  const newContent = newCard.querySelector(".card-content");
  const newTitle = newTop.querySelector("h3");
  const newText = newContent.querySelector("p");
  if (start == end) {
    newTitle.innerText = data.sections[start].sectionHeading;
    newText.innerText = data.sections[start].summary["model1"]["medium"];
  } else {
    startSection = data.sections[start].sectionHeading.split(' ')[1];
    endSection = data.sections[end].sectionHeading.split(' ')[1];
    key = `${startSection.toLowerCase()}-${endSection.toLowerCase()}`;
    newTitle.innerText = `${start}. ${startSection} - ${end}. ${endSection}`;
    newText.innerText = sectionsData[key];
  }
  const newEdit = newCard.querySelector(".card-edit");
  newEdit.remove();
  const newBottom = newCard.querySelector(".card-bottom");
  newBottom.innerHTML = '';
  const newClose = newTop.querySelector(".close-btn");
  newClose.style.display = "block";
  newClose.addEventListener("click", (e) => {
    newCard.remove();
  });

  const btn = document.getElementById("add-card-btn");
  infoContainer.insertBefore(newCard, btn);
}

function updateSummary() {
  const autoCard =  document.getElementById("auto-card");
  const autoCardTop = autoCard.querySelector(".card-top");
  const autoContent = autoCard.querySelector(".card-content");
  const autoTitle = autoCardTop.querySelector("h3");
  const autoText = autoContent.querySelector("p");
  autoTitle.innerText = data.sections[context.sid].sectionHeading;
  autoText.innerText = data.sections[context.sid].summary[sumPara.name][sumPara.length];
}

function getSynonyms(tknDiv) {
  var tkn = tknDiv.innerText;
  var tkn_lower = tkn.toLowerCase();
  tkn_lower = tkn_lower.replace(".", "");
  tkn_lower = tkn_lower.replace("(", "");
  tkn_lower = tkn_lower.replace(")", "");
  tkn_lower = tkn_lower.replace("?", "");
  tkn_lower = tkn_lower.replace("\"", "");

  result = wordMap[tkn_lower];

  return result;
}

function toggleEditMode() {
  const autoCard =  document.getElementById("auto-card");
  const autoContent = autoCard.querySelector(".card-content");
  const autoEdit = autoCard.querySelector(".edit-btn");
  const lenSlider = autoCard.querySelector(".length-slidebar");
  if (!isEdit) {
    var tkns = autoContent.innerText.split(' ');
    autoContent.innerHTML = '';
    lenSlider.disabled = true;
    tkns.forEach((tkn) => {
      const tknDiv = document.createElement("div");
      tknDiv.setAttribute("class", "tkn-div")
      tknDiv.innerText=tkn;
      tknDiv.addEventListener("click", (e) => {
        result = getSynonyms(tknDiv);
        if (typeof result !== "undefined") {
          if (result.length !== 0) {
            const synonymContainer = document.createElement("div");
            synonymContainer.setAttribute("class", "synonym-container");
            var top = tknDiv.getBoundingClientRect().bottom - 
                      autoContent.getBoundingClientRect().top + 40;
            var left = tknDiv.getBoundingClientRect().left -
                      autoContent.getBoundingClientRect().left;
            synonymContainer.style.top = `${top}px`;
            synonymContainer.style.left = `${left}px`;
            for (var i=0; i<result.length; i++) {
              const synonym = document.createElement("div");
              synonym.setAttribute("class", "synonym");
              synonym.innerText = result[i];
              synonym.addEventListener("click", (e) => {
                tknDiv.innerText = synonym.innerText;
                synonymContainer.remove();
              });
              synonymContainer.append(synonym);
            }
            autoContent.append(synonymContainer);
          }
        }
      });
      autoContent.append(tknDiv);
    });
    autoEdit.innerText = "ok";
    isEdit = true;
  } else {
    const tknDivs = document.getElementsByClassName("tkn-div");
    var editResult = "";
    for (var i=0; i < tknDivs.length; i++) {
      editResult += ' ' + tknDivs[i].innerText;
    }
    autoContent.innerHTML = '';
    const newContent = document.createElement("p");
    newContent.innerText = editResult;
    data.sections[context.sid].summary[sumPara.name][sumPara.length] = editResult;
    autoContent.append(newContent);
    autoEdit.innerText = "edit";
    lenSlider.disabled = false;
    isEdit = false;
  }
}

const data = {
	title: `"Person, Shoes, Tree. Is the Person Naked?" What People with Vision Impairments Want in Image Descriptions`,
	sections: [
		{
			sectionHeading: `0. Abstract`,
			sectionContent: [
				`Access to digital images is important to people who are blind or have low vision (BLV). Many contemporary image description efforts do not take into account this population’s nuanced image description preferences. In this paper, we present a qualitative study that provides insight into 28 BLV people’s experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites/platforms, productivity applications, and e-publications. Our findings reveal how image description preferences vary based on the source where digital images are encountered and the surrounding context. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`
			],
			summary: {
				model1: {
          short: `Access to digital images is important to people who are blind or have low vision (BLV) Many contemporary image description efforts do not take into account this population's nuanced image description preferences. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`,
					medium: `Access to digital images is important to people who are blind or have low vision (BLV) Many contemporary image description efforts do not take into account this population’s nuanced image description preferences. Study provides insight into 28 BLV people's experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites, productivity applications, and e-publications. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`,
					long: `Access to digital images is important to people who are blind or have low vision (BLV) Many contemporary image description efforts do not take into account this population’s nuanced image description preferences. Study provides insight into 28 BLV people's experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites, productivity applications, and e-publications. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis. Back to the page you came from, contact us at http://www.mailonlineonline.com/news/science-research-report/blivestories/blueblueblue-blindblindblindness/blueblindness.`
					},
				model2: {
          short: `Access to digital images is important to people who are blind or have low vision (BLV). Many contemporary image description efforts do not take into account this population’s nuanced image description preferences.`,
					medium: `Access to digital images is important to people who are blind or have low vision (BLV). Many contemporary image description efforts do not take into account this population’s nuanced image description preferences.`,
					long: `Access to digital images is important to people who are blind or have low vision (BLV). Our findings reveal how image description preferences vary based on the source where digital images are encountered and the surrounding context. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`
					},
			},
		},
		{
			sectionHeading: `1. Introduction`,
			sectionContent: [
				`Digital images are plentiful across the media and information landscape. Towards enabling people who are blind or have low vision (BLV) to consume such content, a variety of efforts focus on the provision of alternative text (alt text) that is read through a screen reader. A screen reader is a software application that enables people who are BLV to read the text that is displayed on the computer screen with a speech synthesizer or Braille display. Alt text image descriptions are read off by a screen reader when a content author has followed recommended protocol, e.g. [13], and created an alt text attribute within a document or website’s source code.`,
				`Though provision of alt text is a best practice, most digital images lack descriptions. A 2017 study of popular websites in many categories (as ranked by alexa.com) found that between 20% and 35% of images lacked descriptions, and that many images that did contain alt text had extremely low-quality descriptions, such as the word "image" or a filename [17]. Images on social media are particularly problematic; a 2018 study found that only 0.1% of images on Twitter had alt text [16]. While the ideal is for content authors to always provide high quality image descriptions (i.e. using the alt text field) at the time of document authorship, many are not despite efforts and resources developed to scaffold content authors in producing them (e.g., [13, 26]).`,
				`The absence of alt text from content authors has motivated scholars and practitioners to innovate, by introducing a variety of more scalable image description services that are powered by humans [4, 5, 7, 6, 45], computers [14, 24, 35, 37, 38, 43], and a mixture of their efforts [17, 28, 32, 33]. In designing image descriptions, such services can leverage the many guidelines for how to write effective descriptions [13, 11, 26, 29, 30, 34, 39, 41, 42, 44]. However, existing guidelines are limited in that they do not clarify how to account for the finding of Petrie et al. [30] in 2005 – an interview study with five blind people that found that the most useful information to be included "was thought to be context dependent", i.e. based on the source in which the image is found.`,
				`Towards the goal of closing this description gap between what people want and what is provided, we present a qualitative study designed to investigate the image description preferences of people who are BLV. We interviewed 28 BLV people, guided by the question: "What are BLV people’s experiences with and preferences for image descriptions found in different digital sources?". We draw on the following definition of source: the platforms and media where one may encounter digital images. Examples of digital images found in different sources are shown in Figure 1. We focused our investigation on seven sources: news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites/platforms, productivity applications, and e-publications. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources. These recommendations can be of great value for improving human-powered, computer-powered, and hybrid image description services for people who are BLV. More generally, our work contributes to the design of social and technical infrastructures that are accessible to all and support people to engage more fully with digital media.`
			],
			summary: {
				model1: {
          short: `A study of popular websites in many categories found that between 20% and 35% of images lacked descriptions, such as the word "image" or a file. Images on social media are particularly problematic; a 2018 study found that only 0.1% of. images on Twitter had alt text. We present a qualitative study designed to investigate the image description preferences of people who are blind.`,
					medium: `A study of popular websites in many categories found that between 20% and 35% of images lacked descriptions, such as the word "image" or a file. Images on social media are particularly problematic; a 2018 study found that only 0.1% of. images on Twitter had alt text. We present a qualitative study designed to investigate the image description preferences of people who are BLV. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources. These recommendations can be of great value for improving human-powered, computer-powered and hybrid image description services for people.`,
					long: `A study of popular websites in many categories found that between 20% and 35% of images lacked descriptions, such as the word "image" or a file. Images on social media are particularly problematic; a 2018 study found that only 0.1% of. images on Twitter had alt text. We present a qualitative study designed to investigate the image description preferences of people who are BLV. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources. These recommendations can be of great value for improving human-powered, computer-powered and hybrid image description services for people who have low vision (BLV) to people who want to consume digital media. The most useful information to be included is based on the source in which the image is found.`
					},
				model2: {
          short: `Digital images are plentiful across the media and information landscape. A 2017 study of popular websites in many categories (as ranked by alexa.com) found that between 20% and 35% of images lacked descriptions, and that many images that did contain alt text had extremely low-quality descriptions, such as the word "image" or a filename [17]. In designing image descriptions, such services can leverage the many guidelines for how to write effective descriptions [13, 11, 26, 29, 30, 34, 39, 41, 42, 44]. Towards the goal of closing this description gap between what people want and what is provided, we present a qualitative study designed to investigate the image description preferences of people who are BLV.`,
					medium: `Digital images are plentiful across the media and information landscape. Though provision of alt text is a best practice, most digital images lack descriptions. A 2017 study of popular websites in many categories (as ranked by alexa.com) found that between 20% and 35% of images lacked descriptions, and that many images that did contain alt text had extremely low-quality descriptions, such as the word "image" or a filename [17]. In designing image descriptions, such services can leverage the many guidelines for how to write effective descriptions [13, 11, 26, 29, 30, 34, 39, 41, 42, 44]. However, existing guidelines are limited in that they do not clarify how to account for the finding of Petrie et al. [ Towards the goal of closing this description gap between what people want and what is provided, we present a qualitative study designed to investigate the image description preferences of people who are BLV. Examples of digital images found in different sources are shown in Figure 1. These recommendations can be of great value for improving human-powered, computer-powered, and hybrid image description services for people who are BLV.`,
					long: `Digital images are plentiful across the media and information landscape. Towards enabling people who are blind or have low vision (BLV) to consume such content, a variety of efforts focus on the provision of alternative text (alt text) that is read through a screen reader. Though provision of alt text is a best practice, most digital images lack descriptions. A 2017 study of popular websites in many categories (as ranked by alexa.com) found that between 20% and 35% of images lacked descriptions, and that many images that did contain alt text had extremely low-quality descriptions, such as the word "image" or a filename [17]. In designing image descriptions, such services can leverage the many guidelines for how to write effective descriptions [13, 11, 26, 29, 30, 34, 39, 41, 42, 44]. However, existing guidelines are limited in that they do not clarify how to account for the finding of Petrie et al. [ We interviewed 28 BLV people, guided by the question: "What are BLV people’s experiences with and preferences for image descriptions found in different digital sources?". We draw on the following definition of source: the platforms and media where one may encounter digital images. Examples of digital images found in different sources are shown in Figure 1. We focused our investigation on seven sources: news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites/platforms, productivity applications, and e-publications. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources. These recommendations can be of great value for improving human-powered, computer-powered, and hybrid image description services for people who are BLV.`
					},
			},
		},
	],
};

const sectionsData = {
  "abstract-introduction": `Access to digital images is important to people who are blind or have low vision (BLV) We present a qualitative study that provides insight into 28 BLV people’s experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, and productivity applications. Our findings reveal how image description preferences vary based on the source where digital images are encountered and the surrounding context. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`
}

const visualMaps = {
  1: [
    {
      3: {
        id: 1,
        src: "images/imagedesc/f1.PNG",
        desc: `Figure 1. Examples of digital images that participants in our qualitative study encountered when browsing different sources. Participants wanted more information for all these images, particularly because none of the images had associated alt text.`
      }
    }
  ]
};

const wordMap = {
	"access": ['entree', 'accession', 'admission'],
	"to": [],
	"digital": [],
	"images": ['image', 'mental image', 'persona'],
	"is": ['be', 'exist', 'equal'],
	"important": ['of import', 'significant', 'crucial'],
	"people": ['citizenry', 'multitude', 'masses'],
	"who": ['World Health Organization', 'WHO'],
	"are": ['ar', 'be', 'exist'],
	"blind": ['screen', 'subterfuge', 'dim'],
	"or": ['Oregon', 'Beaver State', 'OR'],
	"have": ['rich person', 'wealthy person', 'have got'],
	"low": ['depression', 'Low', 'David Low'],
	"vision": ['sight', 'visual sense', 'visual modality'],
	"blv": [],
	"many": [],
	"contemporary": ['coeval', 'modern-day', 'present-day'],
	"image": ['mental image', 'persona', 'picture'],
	"description": ['verbal description'],
	"efforts": ['attempt', 'effort', 'endeavor'],
	"do": ['bash', 'brawl', 'doh'],
	"not": ['non'],
	"take": ['return', 'issue', 'takings'],
	"into": [],
	"account": ['history', 'chronicle', 'story'],
	"this": [],
	"population’s": [],
	"nuanced": [],
	"preferences": ['preference', 'penchant', 'predilection'],
	"population's": [],
	"we": [],
	"provide": ['supply', 'render', 'furnish'],
	"recommendations": ['recommendation', 'testimonial', 'good word'],
	"for": [],
	"the": [],
	"development": ['evolution', 'growth', 'growing'],
	"of": [],
	"next-generation": [],
	"technologies": ['technology', 'engineering', 'engineering science'],
	"inspired": ['inspire', 'animate', 'invigorate'],
	"by": ['past', 'aside', 'away'],
	"our": [],
	"empirical": ['empiric'],
	"analysis": ['analytic thinking', 'psychoanalysis', 'depth psychology'],
	"study": ['survey', 'work', 'report'],
	"provides": ['supply', 'provide', 'render'],
	"insight": ['penetration', 'perceptiveness', 'perceptivity'],
	"people's": [],
	"experiences": ['experience', 'see', 'go through'],
	"with": [],
	"descriptions": ['description', 'verbal description'],
	"from": [],
	"news": ['intelligence', 'tidings', 'word'],
	"websites,": [],
	"social": ['sociable', 'mixer', 'societal'],
	"networking": ['network'],
	"sites/platforms,": [],
	"ecommerce": [],
	"employment": ['employ', 'work', 'engagement'],
	"online": ['on-line'],
	"dating": ['geological dating', 'date', 'date stamp'],
	"productivity": ['productiveness'],
	"applications,": [],
	"and": [],
	"e-publications": [],
	"findings": ['determination', 'finding', 'find'],
	"reveal": ['uncover', 'bring out', 'unveil'],
	"how": [],
	"vary": ['change', 'alter', 'deviate'],
	"based": ['establish', 'base', 'ground'],
	"on": ['along'],
	"source": ['beginning', 'origin', 'root'],
	"where": [],
	"encountered": ['meet', 'run into', 'encounter'],
	"surrounding": ['surround', 'environ', 'ring'],
	"context": ['linguistic context', 'context of use', 'circumstance'],
	"back": ['dorsum', 'rear', 'spinal column'],
	"page": ['Page', 'Sir Frederick Handley Page', 'Thomas Nelson Page'],
	"you": [],
	"came": ['come', 'come up', 'arrive'],
	"from,": [],
	"contact": ['physical contact', 'impinging', 'striking'],
	"us": ['United States', 'United States of America', 'America'],
	"at": ['astatine', 'At', 'atomic number 85'],
	"http://wwwmailonlineonlinecom/news/science-research-report/blivestories/blueblueblue-blindblindblindness/blueblindness": [],
	"plentiful": ['ample', 'copious', 'plenteous'],
	"across": ['crosswise', 'crossways'],
	"media": ['medium', 'culture medium', 'spiritualist'],
	"information": ['info', 'data', 'selective information'],
	"landscape": ['landscape painting'],
	"a": ['angstrom', 'angstrom unit', 'A'],
	"popular": ['democratic', 'pop'],
	"websites": ['web site', 'website', 'internet site'],
	"in": ['inch', 'indium', 'In'],
	"categories": ['class', 'category', 'family'],
	"as": ['arsenic', 'As', 'atomic number 33'],
	"ranked": ['rank', 'rate', 'range'],
	"alexacom": [],
	"found": ['establish', 'set up', 'launch'],
	"that": [],
	"between": ['betwixt', "'tween"],
	"lacked": ['miss', 'lack'],
	"descriptions,": [],
	"did": ['make', 'do', 'perform'],
	"contain": ['incorporate', 'comprise', 'hold'],
	"alt": ['elevation', 'EL', 'altitude'],
	"text": ['textual matter', 'textbook', 'text edition'],
	"had": ['have', 'have got', 'hold'],
	"extremely": ['highly', 'exceedingly', 'super'],
	"low-quality": [],
	"such": [],
	"word": ['news', 'intelligence', 'tidings'],
	"filename": ['file name', 'computer filename', 'computer file name'],
	"designing": ['design', 'plan', 'project'],
	"services": ['service', 'religious service', 'divine service'],
	"can": ['tin', 'tin can', 'canful'],
	"leverage": ['purchase', 'leveraging'],
	"guidelines": ['guideline', 'road map', 'guidepost'],
	"write": ['compose', 'pen', 'indite'],
	"effective": ['effectual', 'efficacious', 'efficient'],
	"towards": [],
	"goal": ['end', 'finish', 'destination'],
	"closing": ['shutting', 'conclusion', 'end'],
	"gap": ['spread', 'opening', 'crack'],
	"what": [],
	"want": ['privation', 'deprivation', 'neediness'],
	"provided,": [],
	"present": ['nowadays', 'present tense', 'show'],
	"qualitative": [],
	"designed": ['plan', 'project', 'contrive'],
	"investigate": ['look into', 'inquire', 'enquire'],
	"file": ['data file', 'single file', 'Indian file'],
	"particularly": ['peculiarly', 'especially', 'specially'],
	"problematic;": [],
	"only": ['lone', 'lonesome', 'sole'],
	"twitter": ['chirrup', 'chitter'],
	"though": [],
	"provision": ['proviso', 'supply', 'supplying'],
	"best": ['topper', 'Best', 'C. H. Best'],
	"practice,": [],
	"most": ['to the highest degree', 'about', 'almost'],
	"lack": ['deficiency', 'want', 'miss'],
	"however,": [],
	"existing": ['exist', 'be', 'survive'],
	"limited": ['express', 'restrict', 'restrain'],
	"they": [],
	"clarify": ['clear up', 'elucidate'],
	"finding": ['determination', 'find', 'happen'],
	"petrie": [],
	"et": [],
	"al": ['aluminum', 'aluminium', 'Al'],
	"examples": ['example', 'illustration', 'instance'],
	"different": ['unlike', 'dissimilar'],
	"sources": ['beginning', 'origin', 'root'],
	"shown": ['show', 'demo', 'exhibit'],
	"figure": ['fig', 'human body', 'physical body'],
	"these": [],
	"be": ['beryllium', 'Be', 'glucinium'],
	"great": ['outstanding', 'bang-up', 'bully'],
	"value": ['economic value', 'time value', 'note value'],
	"improving": ['better', 'improve', 'amend'],
	"human-powered,": [],
	"computer-powered,": [],
	"hybrid": ['loanblend', 'loan-blend', 'crossbreed'],
	"conclude": ['reason', 'reason out', 'resolve'],
	"regarding": ['see', 'consider', 'reckon'],
	"incorporate": ['integrate', 'contain', 'comprise'],
	"computer-powered": [],
	"enabling": ['enable'],
	"consume": ['devour', 'down', 'go through'],
	"content,": [],
	"variety": ['assortment', 'mixture', 'mixed bag'],
	"focus": ['focusing', 'focussing', 'focal point'],
	"alternative": ['option', 'choice', 'alternate'],
	"read": ['say', 'scan', 'take'],
	"through": ['done', 'through with', 'through and through'],
	"screen": ['silver screen', 'projection screen', 'blind'],
	"reader": ['subscriber', 'reviewer', 'referee'],
	"interviewed": ['interview', 'question'],
	"people,": [],
	"guided": ['steer', 'maneuver', 'manoeuver'],
	"question:": [],
	"people’s": [],
	"draw": ['drawing card', 'attraction', 'attractor'],
	"following": ['followers', 'pursuit', 'chase'],
	"definition": [],
	"source:": [],
	"platforms": ['platform', 'political platform', 'political program'],
	"one": ['1', 'I', 'ace'],
	"may": ['May', 'whitethorn', 'English hawthorn'],
	"encounter": ['brush', 'clash', 'skirmish'],
	"focused": ['concentrate', 'focus', 'center'],
	"investigation": ['probe', 'investigating'],
	"seven": ['7', 'VII', 'sevener'],
	"sources:": [],
	"websites/platforms,": [],
	"useful": ['utile', 'utilitarian'],
	"included": ['include', 'admit', 'let in'],
	"which": []
};

const context = {
  sid: 0,
  pid: 0
};

const modelList = ["DistilBart","SciBert"];

const sumPara = {
  name: "model1",
  length: "medium"
};

let isOpen = false;

let isEdit = false;

const initialLoad = () => {
  clearPaper();
  loadPaper();
  updateContext();
  updateSummary();
  initEventListener();
};

initialLoad();

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
    {
			sectionHeading: `2. Related-work`,
			sectionContent: [
				`Our research builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. Of importance, throughout this paper we use the term description as opposed to caption or alt text. Though the terms alt text and caption are commonly used in related scholarship, they infer specific linguistic structures of description that does not take into account contemporary AI-powered approaches to description as described in [28, 35].`,
				`Guidelines for Describing Images to People Who are BLV 
The task of creating image descriptions–interpreting visual information and transmuting its meaning into language–is non-trivial [20, 23, 26]. Still, numerous efforts have made authoring image descriptions more approachable. Many focus on guiding web developers [41]. For instance, the Web Content Accessibility Guidelines (WCAG) provide basic instructions for the generation of alt text. The Diagram Center [11] provides instruction on assessing whether images are functional or decorative, whether information can be gathered from surrounding text, and to provide age-appropriate descriptions. The Diagram Center also notes that effective image captions describe foreground, background, color, and directional orientation of objects [11]. Such suggestions are in line with findings from related scholarship [34].`,
				`While the aforementioned works focus on one-size-fits-all guidelines for authoring image descriptions, other efforts have noted that descriptions need to be responsive to the context in which an image is found. Petrie et al. (2005) championed this idea [30], albeit did not present findings according to individual source types. Rather, they recommended guidelines that represented description preferences commonly observed across 10 sources (10 homepages in 10 different sectors), which were that descriptions include 1) the purpose of the image, 2) what objects and people are present, 3) any activities in progress, 4) the location, 5) colors, and 6) emotion [30]. More recently, researchers have discussed the types of content that should be included in descriptions of images found on social networking sites (SNS): describe all salient objects [29]; specify who is in the image, where it was taken, and others’ responses to it [39]; indicate key visual elements, people, and photo quality [44]; and when captioning people, objects, and settings, specify details including the people count, facial expression, age, inside, outdoor, nature, close-up, and selfie [42]. Our work extends these prior works by identifying preferences of people who are BLV across seven sources. Building upon our observations, we also propose recommendations for the types of content that image description technologies should deliver for people who are BLV.`,
				`Understanding Users’ Experiences with Descriptions 
Our work relates to the body of literature aimed at understanding how people who are BLV experience image descriptions provided by technologies. The literature shows that people who are BLV want descriptions for digital images found on websites [30], on SNS [2, 29, 39], within digital publications, and in productivity applications [15]. Like many, they place value in image descriptions to stay up to date with the news [29], to enjoy entertainment media [29], and to engage in social interactions [2, 10, 29, 39, 44]. In addition to these common uses of images, people who are BLV depend on image descriptions to avoid risk (by not sharing images deemed unprofessional or low quality, or images that contain inappropriate content) [2, 8, 44]. In addition, scholars have found that people who are BLV want descriptions for images that they take in order to learn about the content of these images [4, 44]. `,
				`While the need for image descriptions is clear, few prior studies focus on understanding BLV people’s preferences for what kind of content they want described for images found on different sources. Our current understanding comes from a small body of dispersed literature. As previously noted, in 2005 Petrie et al. asked five BLV participants about the kinds of images they wanted described, what image content they wanted described, and their preferred length of description [30]. Others focused on BLV participants’ experience with descriptions for images presented on social media platforms and how BLV users perceive automatically generated captions [25, 43, 44]. Finally, others have inquired into how people who are BLV want to interact with image descriptions, and how different delivery structures impact their experience [28, 35, 40]. Despite the importance of these findings, to our knowledge no prior work has explored how BLV people’s preferences for the content in the image descriptions vary based on where they encounter an image description (e.g. on a social media site versus in an e-textbook). Our work fills this gap towards supporting opportunities to make image descriptions context-specific.`,
				`Image Description Technologies 
Many images found on digital sources do not contain alt text or effective image descriptions [17, 16]. The low rate of manually-produced descriptions has inspired some investigations into new approaches to generate image descriptions. These approaches are often described as human-powered, automated, and hybrid approaches. Human-powered approaches [5] provide near-real-time descriptions of images through crowdsourcing [4, 45], friendsourcing [7], and social microvolunteering [6]. Automated image description approaches employ artificial intelligence models to generate image descriptions [24, 14, 38, 37, 43, 35]. Hybrid image description technologies create human-in-the-loop workflows that work in tandem with automated approaches [17, 28, 32, 33]. Tools also have been introduced to train non-specialists (including crowdworkers) to identify which images and diagrams in text books need alt text [12, 26]. Extending prior work, our study reveals new design opportunities for improving image description technologies by contextualizing descriptions based on the source where images are found.`
			],
			summary: {
        model1: {
					short: `The task of creating image descriptions–interpreting visual information and transmuting its meaning into language–is non-trivial. People who are BLV place value in image descriptions to stay up to date with the news, enjoy entertainment media, and engage in social interactions. Our work builds on prior work including guidelines for alt text image descriptions.`,
					medium: `The task of creating image descriptions–interpreting visual information and transmuting its meaning into language–is non-trivial. People who are BLV place value in image descriptions to stay up to date with the news, enjoy entertainment media, and engage in social interactions. Our work builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. We use the term description as opposed to caption or alt text.`,
					long: `The task of creating image descriptions–interpreting visual information and transmuting its meaning into language–is non-trivial. People who are BLV place value in image descriptions to stay up to date with the news, enjoy entertainment media, and engage in social interactions. Our work builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. We use the term description as opposed to caption or alt text, though the terms alt text and caption are commonly used in related scholarship, but they infer specific linguistic structures of description that does not take into account contemporary AI-powered approaches to description as described in [28, 35]. Our work fills this gap towards supporting image descriptions`
				},
				model2: {
					short: `Our research builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. For instance, the Web Content Accessibility Guidelines (WCAG) provide basic instructions for the generation of alt text. Such suggestions are in line with findings from related scholarship [34]. Understanding Users’ Experiences with Descriptions 
`,
					medium: `Our research builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. Of importance, throughout this paper we use the term description as opposed to caption or alt text. Though the terms alt text and caption are commonly used in related scholarship, they infer specific linguistic structures of description that does not take into account contemporary AI-powered approaches to description as described in [28, 35]. Still, numerous efforts have made authoring image descriptions more approachable. Many focus on guiding web developers [41]. For instance, the Web Content Accessibility Guidelines (WCAG) provide basic instructions for the generation of alt text. While the aforementioned works focus on one-size-fits-all guidelines for authoring image descriptions, other efforts have noted that descriptions need to be responsive to the context in which an image is found. Building upon our observations, we also propose recommendations for the types of content that image description technologies should deliver for people who are BLV. Understanding Users’ Experiences with Descriptions 
`,
					long: `Our research builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. Of importance, throughout this paper we use the term description as opposed to caption or alt text. Though the terms alt text and caption are commonly used in related scholarship, they infer specific linguistic structures of description that does not take into account contemporary AI-powered approaches to description as described in [28, 35]. Still, numerous efforts have made authoring image descriptions more approachable. Many focus on guiding web developers [41]. For instance, the Web Content Accessibility Guidelines (WCAG) provide basic instructions for the generation of alt text. Such suggestions are in line with findings from related scholarship [34]. While the aforementioned works focus on one-size-fits-all guidelines for authoring image descriptions, other efforts have noted that descriptions need to be responsive to the context in which an image is found. More recently, researchers have discussed the types of content that should be included in descriptions of images found on social networking sites (SNS): describe all salient objects [29]; specify who is in the image, where it was taken, and others’ responses to it [39]; indicate key visual elements, people, and photo quality [44]; and when captioning people, objects, and settings, specify details including the people count, facial expression, age, inside, outdoor, nature, close-up, and selfie [42]. Our work extends these prior works by identifying preferences of people who are BLV across seven sources. Building upon our observations, we also propose recommendations for the types of content that image description technologies should deliver for people who are BLV. Understanding Users’ Experiences with Descriptions 
`
				},
			},
		},
		{
			sectionHeading: `3. Study-Design`,
			sectionContent: [
				`We conducted a qualitative study guided by the following two research questions: 
RQ1: What are BLV people’s experiences with digital images on different sources? 
RQ2: What are BLV people’s description preferences for digital images in these different sources? 
We formed these questions based on the understanding that source is a significant factor that impacts a person’s description preferences [30]. We assumed this to be the case in order to limit the scope of this study.`,
				`Data Collection 
To learn about BLV people’s experiences with digital images that they encounter on different sources, we designed a semistructured interview protocol that included 15 open-ended questions, 13 Likert survey statements, and a contextual inquiry. Prior to each interview, we asked each participant to bring their preferred access technology with them. We audio recorded each interview. After the interviews, we sent the audio files to be transcribed by a professional service. We also took field notes to keep track of emerging themes.`,
				`Our interview procedures are in the Supplementary Materials. In summary, for the open-ended research questions, we asked about our participants’ visual impairment, access technology preferences, experience with digital images, and experience with technologies and services that provide image description (from alt text to automated image description services). For the contextual inquiry, we asked participants to open their technology and visit three to five sources where they would expect to find digital images; the number of sources varied based on how long it took for the participant to complete the task or their familiarity and interest in the source. We suggested the following options: a news website, a SNS post, an eCommerce website, an organization or employment web page, and a productivity document, e.g. Word or PowerPoint. We identified these sources based on prior work that indicated that people who are BLV want image descriptions to pursue their interests through staying up to date with the news [29], enjoying entertainment media [29], eCommerce [35], staying socially connected [39, 29, 2, 44, 10], dating [31] and performing work or academic pursuits [15].`,
				`Participant Recruitment 
We recruited participants by circulating an IRB-approved announcement on social media, on a listserv managed by orga-nizations serving people who have visual impairments, and through snowball sampling at an independence training cen-ter. To be eligible, we specified that participants had to be at least 18 years old, be BLV, and use a screen reader and/or magnification. The announcement explained that participants would be compensated with an Amazon gift card, at the rate of 20 USD per hour. We aimed to have equal participation of people who have congenital blindness, acquired blindness, congenital low vision, and acquired low vision. At the onset of recruitment, we accepted all participants that met our basic criteria for inclusion. After 20 participants were recruited, we selected participants based on their visual impairment towards the goal of equal representation.`,
				`In total, 28 people participated in our study. We conducted 25 of the interviews in person in a 50 mile radius of our U.S. metro area, and another 3 over the phone with individuals in other states to achieve greater diversity of visual experience within our participant pool. The same protocol was used when conducting the interview over the phone, with the key dis-tinction being that the researcher and the participant accessed the image sources on their own devices when conducting the contextual inquiries. We believe that we reached participant saturation based on Alroobaea et al.’s finding, which states that there is no certain number of participants for finding all usabil-ity problems (during interviews and think-aloud approaches), though the rule of 16+/-4 users gains much validity in user testing [1]. The interviews lasted between 1.25 hours and 2 hours, depending on the participant’s experiences and interest in the topic. All participants used Apple or Android phones for the contextual inquiries.`,
				`Table 1 summarizes participants’ demographic information. As shown, the participants represent a diversity of backgrounds in terms of gender (16 women, 12 men), age (range is 18 to 67 with a mean of 39.05), education (from people who had not completed high school to people who have a doctorate), and occupation (from people who are unemployed or retired, to those who are students, DJs, lawyers, and educators). These participants had a range of visual impairments (from unformed retinas, to myopia, to blindness acquired due to laser surgery) as well as varied experiences with visual information.`,
				`Data Analysis 
After conducting all 28 interviews, we performed a qualitative analysis of the transcribed data. We then performed axial coding, a process of identifying and relating codes to each other, via a combination of inductive and deductive thinking [36]. We used deductive reasoning to identify the sources of interest based on the literature, and then inductive reasoning to attribute the content patterns to these sources. To prepare the data for the axial coding, two team members cleaned up major errors in the transcript by reviewing the audio, all the while taking analytical memos to record emergent themes.`,
				`At the onset we established the seven sources (news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites/platforms, productivity applications, and e-publications) plus an other category to account for emergent sources as parent codes (or primary phenomena orienting the study). We then used a semantic analysis technique to identify and code text segments according to the parent codes. Braun and Clark explain that to perform semantic analysis one should "not [be] looking for anything beyond what a participant has said or what has been written [9]." While doing this, we dynamically identified and refined a set of child codes. Child codes that we identified include: Image Access Behavior: statements about how one approaches consuming the media; Image Access Experience: statements related to one’s exposure or interaction with content in digital images; Description Content Wants: statements about the features, attributes, or details that should be included in an image description, and Description Considerations: statements related to the factors that impact image access or content preferences. Within each subset of data we made note of common and unique themes amongst all participants’ responses. For instance, under the child code Description Content Wants we noticed often times participants talked about the level of detail they wanted for an image on a source or their need to understand the purpose of an image.`,
				`Performing the qualitative data analysis with the sources as the parent codes enabled us to perform a cross-source analysis that highlights how our participants’ image experiences and description content preferences differ based on source. Of note, we present the variety of perspectives shared by our participants, as opposed to a quantitative analysis of how many people in our participant group shared the same experience, because the aim of this work was to understand the range of experiences and content wants as opposed to the frequency.`
			],
			summary: {
        model1: {
					short: `We designed a semistructured interview protocol that included 15 open-ended questions, 13 Likert survey statements, and a contextual inquiry. 28 people participated in our study. Participants were recruited by circulating an IRB-approved announcement on social media, on a listserv managed by orga-nizations serving people who have visual impairments.`,
					medium: `We designed a semistructured interview protocol that included 15 open-ended questions, 13 Likert survey statements, and a contextual inquiry. 28 people participated in our study. Participants were recruited by circulating an IRB-approved announcement on social media, on a listserv managed by orga-nizations serving people who have visual impairments, and through snowball sampling at an independence training cen-ter. The interviews lasted between 1.25 hours and 2 hours, depending on participant’s experiences and interest in the topic.`,
					long: `We designed a semistructured interview protocol that included 15 open-ended questions, 13 Likert survey statements, and a contextual inquiry. 28 people participated in our study. Participants were recruited by circulating an IRB-approved announcement on social media, on a listserv managed by orga-nizations serving people who have visual impairments, and through snowball sampling at an independence training cen-ter. The interviews lasted between 1.25 hours and 2 hours, depending on the participant’s experiences and interest in the topic. All participants used Apple or Android phones for the contextual inquiries. We used deductive reasoning and deductive thinking to identify the sources of interest based on the content of interest. We then performed a laser-based analysis of the data.`
				},
				model2: {
					short: `We conducted a qualitative study guided by the following two research questions: 
`,
					medium: `We conducted a qualitative study guided by the following two research questions: 
`,
					long: `We conducted a qualitative study guided by the following two research questions: 
`
				},
			},
		},
	],
};

const sectionsData = {
	"abstract-introduction": `Access to digital images is important to people who are blind or have low vision (BLV) Many contemporary image description efforts do not take into account this population’s nuanced image description preferences. Study provides insight into 28 BLV people's experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, online dating websites, productivity applications, and e-publications. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`,
	"abstract-related-work": `Access to digital images is important to people who are blind or have low vision (BLV) We present a qualitative study that provides insight into 28 BLV people’s experiences with descriptions of digital images from news websites, social networking sites/platforms, eCommerce websites, employment websites, productivity applications, and e-publications. Our findings reveal how image description preferences vary based on the source where digital images are encountered and the surrounding context. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis.`,
	"abstract-study-design": `Access to digital images is important to people who are blind or have low vision (BLV) We present a qualitative study that provides insight into 28 BLV people’s experiences with descriptions of digital images. Our findings reveal how image description preferences vary based on the source where digital images are encountered and the surrounding context. We provide recommendations for the development of next-generation image description technologies inspired by our empirical analysis. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources.`,
	"introduction-related-work": `A study of popular websites in many categories found that between 20% and 35% of images lacked descriptions, such as the word "image" or a file. Images on social media are particularly problematic; a 2018 study found that only 0.1% of. images on Twitter had alt text. We present a qualitative study designed to investigate the image description preferences of people who are BLV. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources. These recommendations can be of great value for improving human-powered, computer-powered and hybrid image description services for people.`,
	"introduction-study-design": `A study of popular websites in many categories (as ranked by alexa.com) found that between 20% and 35% of images lacked descriptions, such as the word "image" or a filename. Images on social media are particularly problematic; a 2018 study found that only 0.1% of. images on Twitter had alt text. We present a qualitative study designed to investigate the image description preferences of people who are BLV. We conclude with recommendations regarding what is important information to incorporate into image descriptions found in different sources.`,
	"related-work-study-design": `The task of creating image descriptions–interpreting visual information and transmuting its meaning into language–is non-trivial. People who are BLV place value in image descriptions to stay up to date with the news, enjoy entertainment media, and engage in social interactions. Our work builds on prior work including guidelines for alt text image descriptions, studies about BLV users’ image description preferences, and systems for facilitating or automating image description. We use the term description as opposed to caption or alt text.`,
};
const visualMaps = {
  1: [
    {
      3: {
        id: 1,
        src: "images/imagedesc/f1.PNG",
        desc: `Figure 1. Examples of digital images that participants in our qualitative study encountered when browsing different sources. Participants wanted more information for all these images, particularly because none of the images had associated alt text.`
      }
    }
  ],
  3: [
    {
      6: {
        id: 1,
        src: "images/imagedesc/t1.PNG",
        desc: `Table 1. Demographics of study participants. G=Gender (M=Male; F=Female). Edu=Education (< H.S.= Some High School; H.S.=High School; AA=Associates; < B.A.=Some Bachelors of Arts; B.A.=Bachelors of Arts; < M.S.=Some Masters in Science; M.S.=Masters in Arts;M.Ed.=Masters in Education; < PhD=Some Doctorate JD-Law=Doctor of Jurisprudence). Vis Exp=Visual Experience (CTB = Congenital Total Blindness: No visual cues or direct visual experience with images; CB-LC = Congenital Blindness with some light/color perception: No direct experience with images; ATB = Acquired Total Blindness: Prior experience with images; AB-LC = Acquired Blindness with some light/color perception: Prior direct experience with images; CLV = Congenital Low-Vision: Limited prior experience with images; ALV = Acquired Low-Vision: Prior experience with images). Access Tech (iOS Mag=iOS Magnification Tools; iOS V.O.=iOS Voice Over; Android S2S=Android Select to Speak).`
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
	"which": [],
	"research": ['inquiry', 'enquiry', 'search'],
	"builds": ['physique', 'build', 'body-build'],
	"prior": ['anterior'],
	"work": ['piece of work', 'employment', 'study'],
	"including": ['include', 'admit', 'let in'],
	"studies": ['survey', 'study', 'work'],
	"about": ['astir', 'approximately', 'close to'],
	"users’": [],
	"preferences,": [],
	"systems": ['system', 'scheme', 'system of rules'],
	"facilitating": ['facilitate', 'ease', 'alleviate'],
	"automating": ['automatize', 'automatise', 'automate'],
	"instance,": [],
	"web": ['entanglement', 'vane', 'network'],
	"content": ['message', 'subject matter', 'substance'],
	"accessibility": ['handiness', 'availability', 'availableness'],
	"wcag": [],
	"basic": ['BASIC', 'staple', 'canonic'],
	"instructions": ['instruction manual', 'book of instructions', 'operating instructions'],
	"generation": ['coevals', 'contemporaries', 'genesis'],
	"suggestions": ['suggestion', 'proposition', 'proffer'],
	"line": ['argumentation', 'logical argument', 'argument'],
	"related": ['associate', 'tie in', 'relate'],
	"scholarship": ['eruditeness', 'erudition', 'learnedness'],
	"understanding": ['apprehension', 'discernment', 'savvy'],
	"task": ['undertaking', 'project', 'labor'],
	"creating": ['make', 'create', 'produce'],
	"descriptions–interpreting": [],
	"visual": ['ocular', 'optic', 'optical'],
	"transmuting": ['transform', 'transmute', 'metamorphose'],
	"its": ['information technology', 'IT'],
	"meaning": ['significance', 'signification', 'import'],
	"language–is": [],
	"non-trivial": [],
	"place": ['topographic point', 'spot', 'property'],
	"stay": ['arrest', 'check', 'halt'],
	"up": ['astir', 'improving', 'upward'],
	"date": ['day of the month', 'escort', 'appointment'],
	"news,": [],
	"enjoy": ['bask', 'relish', 'savor'],
	"entertainment": ['amusement'],
	"media,": [],
	"engage": ['prosecute', 'pursue', 'absorb'],
	"interactions": ['interaction', 'fundamental interaction'],
	"importance,": [],
	"throughout": ['end-to-end', 'passim'],
	"paper": ['composition', 'report', 'theme'],
	"use": ['usage', 'utilization', 'utilisation'],
	"term": ['condition', 'full term', 'terminus'],
	"opposed": ['oppose', 'fight', 'fight back'],
	"caption": ['subtitle', 'legend'],
	"terms": ['footing', 'price', 'damage'],
	"commonly": ['normally', 'usually', 'unremarkably'],
	"used": ['use', 'utilize', 'utilise'],
	"scholarship,": [],
	"infer": ['deduce', 'deduct', 'derive'],
	"specific": ['particular'],
	"linguistic": ['lingual'],
	"structures": ['structure', 'construction', 'anatomical structure'],
	"does": ['Department of Energy', 'Energy Department', 'Energy'],
	"ai-powered": [],
	"approaches": ['approach', 'attack', 'plan of attack'],
	"described": ['describe', 'depict', 'draw'],
	"still,": [],
	"numerous": ['legion'],
	"made": ['make', 'do', 'get'],
	"authoring": ['author'],
	"more": ['More', 'Thomas More', 'Sir Thomas More'],
	"approachable": ['accessible', 'reachable'],
	"guiding": ['steer', 'maneuver', 'manoeuver'],
	"developers": ['developer'],
	"while": ['piece', 'spell', 'patch'],
	"aforementioned": ['aforesaid', 'said'],
	"works": ['plant', 'industrial plant', 'whole shebang'],
	"one-size-fits-all": [],
	"other": ['early', 'former'],
	"noted": ['note', 'observe', 'mention'],
	"need": ['demand', 'want', 'motivation'],
	"responsive": ['antiphonal', 'reactive'],
	"an": ['Associate in Nursing', 'AN'],
	"building": ['edifice', 'construction', 'construct'],
	"upon": [],
	"observations,": [],
	"also": ['besides', 'too', 'likewise'],
	"propose": ['suggest', 'advise', 'project'],
	"types": ['type', 'character', 'eccentric'],
	"should": [],
	"deliver": ['present', 'hand over', 'fork over'],
	"recently,": [],
	"researchers": ['research worker', 'researcher', 'investigator'],
	"discussed": ['discourse', 'talk about', 'discuss'],
	"sites": ['site', 'land site', 'situation'],
	"sns:": [],
	"describe": ['depict', 'draw', 'report'],
	"all": ['wholly', 'entirely', 'completely'],
	"salient": ['outstanding', 'prominent', 'spectacular'],
	"objects": ['object', 'physical object', 'aim'],
	"specify": ['stipulate', 'qualify', 'condition'],
	"image,": [],
	"it": ['information technology', 'IT'],
	"was": ['Washington', 'Evergreen State', 'WA'],
	"taken,": [],
	"others’": [],
	"responses": ['response', 'reaction', 'answer'],
	"indicate": ['bespeak', 'betoken', 'point'],
	"key": ['tonality', 'samara', 'key fruit'],
	"elements,": [],
	"photo": ['photograph', 'exposure', 'picture'],
	"quality": ['caliber', 'calibre', 'character'],
	"when": [],
	"captioning": ['caption'],
	"objects,": [],
	"settings,": [],
	"details": ['inside information', 'detail', 'item'],
	"count,": [],
	"facial": ['facial nerve', 'nervus facialis', 'seventh cranial nerve'],
	"expression,": [],
	"age,": [],
	"inside,": [],
	"outdoor,": [],
	"nature,": [],
	"close-up,": [],
	"selfie": [],
	"extends": ['widen', 'broaden', 'extend'],
	"identifying": ['identify', 'place', 'name'],
	"text,": [],
	"but": ['merely', 'simply', 'just'],
	"fills": ['fill', 'filling', 'fill up'],
	"supporting": ['support', 'back up', 'back'],
	"conducted": ['conduct', 'carry on', 'deal'],
	"two": ['2', 'II', 'deuce'],
	"questions:": [],
	"semistructured": [],
	"interview": ['consultation', 'audience', 'question'],
	"protocol": ['communications protocol'],
	"open-ended": [],
	"questions,": [],
	"likert": [],
	"survey": ['study', 'sketch', 'resume'],
	"statements,": [],
	"contextual": [],
	"inquiry": ['enquiry', 'research', 'question'],
	"participated": ['participate', 'take part', 'enter'],
	"participants": ['participant', 'player'],
	"were": ['be', 'exist', 'equal'],
	"recruited": ['enroll', 'inscribe', 'enter'],
	"circulating": ['go around', 'spread', 'circulate'],
	"irb-approved": [],
	"announcement": ['proclamation', 'annunciation', 'declaration'],
	"listserv": [],
	"managed": ['pull off', 'negociate', 'bring off'],
	"orga-nizations": [],
	"serving": ['helping', 'portion', 'service'],
	"impairments": ['damage', 'harm', 'impairment'],
	"impairments,": [],
	"snowball": ['sweet sand verbena', 'Abronia elliptica'],
	"sampling": ['sample distribution', 'sample', 'try'],
	"independence": ['independency', 'Independence'],
	"training": ['preparation', 'grooming', 'education'],
	"cen-ter": [],
	"interviews": ['interview', 'consultation', 'audience'],
	"lasted": ['last', 'endure', 'survive'],
	"hours": ['hour', 'hr', '60 minutes'],
	"hours,": [],
	"depending": ['depend', 'count', 'bet'],
	"participant’s": [],
	"interest": ['involvement', 'sake', 'interestingness'],
	"topic": ['subject', 'theme', 'issue'],
	"apple": ['orchard apple tree', 'Malus pumila'],
	"android": ['humanoid', 'mechanical man'],
	"phones": ['telephone', 'phone', 'telephone set'],
	"inquiries": ['inquiry', 'enquiry', 'research'],
	"deductive": [],
	"reasoning": ['logical thinking', 'abstract thought', 'reason'],
	"thinking": ['thought', 'thought process', 'cerebration'],
	"identify": ['place', 'name', 'discover'],
	"then": ['so', 'and so', 'and then'],
	"performed": ['perform', 'execute', 'do'],
	"laser-based": [],
	"data": ['information', 'datum', 'data point']
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

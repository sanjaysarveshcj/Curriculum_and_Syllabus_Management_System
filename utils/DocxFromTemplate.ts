import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface TemplateData {
  [key: string]: string | any; 
}

// Helper function to detect Tamil text
function containsTamilText(text: string): boolean {
  // Tamil Unicode range: U+0B80–U+0BFF
  return /[\u0B80-\u0BFF]/.test(text);
}

// Helper function to add Tamil font support to DOCX content
function addTamilFontSupport(zip: PizZip): void {
  try {
    // Get the document.xml content
    const docXml = zip.files["word/document.xml"];
    if (!docXml) return;

    let content = docXml.asText();
    
    // Find and replace Tamil text with Nirmala UI font, keeping Cambria for English
    content = content.replace(
      /(<w:t[^>]*>)([^<]*?)(<\/w:t>)/g,
      (match, openTag, text, closeTag) => {
        if (containsTamilText(text)) {
          // Apply Nirmala UI for Tamil text
          return `${openTag}<w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:cs="Nirmala UI" w:eastAsia="Nirmala UI"/></w:rPr>${text}${closeTag}`;
        } else {
          // Keep Cambria for English text (or add it explicitly)
          return `${openTag}<w:rPr><w:rFonts w:ascii="Cambria" w:hAnsi="Cambria" w:cs="Cambria" w:eastAsia="Cambria"/></w:rPr>${text}${closeTag}`;
        }
      }
    );

    // Update the file content
    zip.file("word/document.xml", content);

    // Add font table entries if they don't exist
    const fontTablePath = "word/fontTable.xml";
    let fontTableContent = '';
    
    if (zip.files[fontTablePath]) {
      fontTableContent = zip.files[fontTablePath].asText();
    } else {
      // Create basic fontTable.xml if it doesn't exist
      fontTableContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
</w:fonts>`;
    }

    // Add Nirmala UI font to font table if not already present
    if (!fontTableContent.includes('Nirmala UI')) {
      const nirmalaUIFontEntry = `
  <w:font w:name="Nirmala UI">
    <w:panose1 w:val="02020603050405020304"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E4002EFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="200001FF" w:csb1="00000000"/>
  </w:font>`;
      
      fontTableContent = fontTableContent.replace('</w:fonts>', `${nirmalaUIFontEntry}\n</w:fonts>`);
    }

    // Add Cambria font to font table if not already present
    if (!fontTableContent.includes('Cambria')) {
      const cambriaFontEntry = `
  <w:font w:name="Cambria">
    <w:panose1 w:val="02040503050406030204"/>
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E00002FF" w:usb1="4000004B" w:usb2="00000009" w:usb3="00000000" w:csb0="0000019F" w:csb1="00000000"/>
  </w:font>`;
      
      fontTableContent = fontTableContent.replace('</w:fonts>', `${cambriaFontEntry}\n</w:fonts>`);
    }

    zip.file(fontTablePath, fontTableContent);

    // Ensure fontTable.xml is listed in content types
    const contentTypesPath = "[Content_Types].xml";
    if (zip.files[contentTypesPath]) {
      let contentTypes = zip.files[contentTypesPath].asText();
      if (!contentTypes.includes('fontTable.xml')) {
        const fontTableOverride = '<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>';
        contentTypes = contentTypes.replace('</Types>', `  ${fontTableOverride}\n</Types>`);
        zip.file(contentTypesPath, contentTypes);
      }
    }

    // Ensure fontTable.xml is listed in document relationships
    const relsPath = "word/_rels/document.xml.rels";
    if (zip.files[relsPath]) {
      let rels = zip.files[relsPath].asText();
      if (!rels.includes('fontTable.xml')) {
        // Find the highest existing ID
        const idMatches = rels.match(/Id="rId(\d+)"/g);
        let maxId = 0;
        if (idMatches) {
          idMatches.forEach(match => {
            const id = parseInt(match.match(/rId(\d+)/)?.[1] || '0');
            if (id > maxId) maxId = id;
          });
        }
        const newId = `rId${maxId + 1}`;
        const fontTableRel = `<Relationship Id="${newId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>`;
        rels = rels.replace('</Relationships>', `  ${fontTableRel}\n</Relationships>`);
        zip.file(relsPath, rels);
      }
    }

  } catch (error) {
    console.warn('Failed to add Tamil font support:', error);
  }
}

export async function generateDocxFromTemplate(
  templateUrl: string,
  data: TemplateData,
): Promise<Blob> {
  try {
    // 1. Fetch template .docx file
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template from ${templateUrl}: ${response.statusText}`);
    }

    const content = await response.arrayBuffer();

    // 2. Load template into PizZip
    const zip = new PizZip(content);

    // 3. Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });

    // 4. Inject your data
    doc.setData(data);
    doc.render();

    // 5. Get the generated zip
    const generatedZip = doc.getZip();

    // 6. Add Tamil font support to the generated document
    addTamilFontSupport(generatedZip);

    // 7. Generate Blob with font support
    const docxBlob = generatedZip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return docxBlob;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error(`Failed to generate DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

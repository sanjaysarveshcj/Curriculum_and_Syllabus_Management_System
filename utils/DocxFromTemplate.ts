import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface TemplateData {
  [key: string]: string | any; 
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

    // 5. Generate Blob
    const docxBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });



    return docxBlob;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error(`Failed to generate DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}




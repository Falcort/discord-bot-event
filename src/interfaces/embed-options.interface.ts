import status from '@/interfaces/status.interface';

interface EmbedOptionsInterface {
  thumbnail?: status;
  image?: string;
  langMessageArgs?: Record<string, string>;
}
export default EmbedOptionsInterface;

// src/pages/PlayEpisodeWrapper.jsx
import { useParams } from 'react-router-dom';
import PlayEpisode from './PlayEpisode';

export default function PlayEpisodeWrapper() {
  const { id } = useParams();
  return <PlayEpisode key={id} />;
}

import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

export function getFileRequestLink(hash: string) {
  return `${getBootstrapData().settings.base_url}/drive/r/${hash}`;
}

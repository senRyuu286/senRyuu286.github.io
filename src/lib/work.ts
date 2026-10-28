import { getCollection } from 'astro:content';
import { buildSearchText, type WorkType } from './filter';
import { isUrl } from './site';

export interface WorkItem {
  id: string;
  title: string;
  type: WorkType;
  year: string;
  status: string;
  tags: string[];
  /** Lines shown under the title. */
  details: string[];
  href?: string;
  external: boolean;
  searchText: string;
}

function make(item: Omit<WorkItem, 'searchText'>): WorkItem {
  return {
    ...item,
    searchText: buildSearchText([item.title, item.type, item.year, item.status, ...item.tags, ...item.details]),
  };
}

export async function getWorkItems(): Promise<WorkItem[]> {
  const [projects, certificates, activities] = await Promise.all([
    getCollection('projects'),
    getCollection('certificates'),
    getCollection('activities'),
  ]);

  const items: WorkItem[] = [
    ...projects.map(({ id, data }) =>
      make({
        id: `project-${id}`,
        title: data.title,
        type: 'Project',
        year: data.year,
        status: data.status,
        tags: data.tags,
        details: [data.summary],
        href: `/work/${id}/`,
        external: false,
      }),
    ),
    ...certificates.map(({ id, data }) =>
      make({
        id: `certificate-${id}`,
        title: data.title,
        type: 'Certificate',
        year: data.year,
        status: data.status,
        tags: data.tags,
        details: [`Issued by ${data.issuer}`],
        href: data.credentialUrl !== undefined && isUrl(data.credentialUrl) ? data.credentialUrl : undefined,
        external: true,
      }),
    ),
    ...activities.map(({ id, data }) =>
      make({
        id: `activity-${id}`,
        title: data.title,
        type: 'Activity',
        year: data.year,
        status: data.status,
        tags: data.tags,
        details: [`${data.role}, ${data.organization}`, data.summary],
        external: false,
      }),
    ),
  ];

  return items.sort((a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title));
}
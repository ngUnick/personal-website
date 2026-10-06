import { routes } from './app.routes';
import { AdminEducationEditorPage } from './admin/admin-education-editor.page';

describe('application routes', () => {
  it('routes an Education UUID edit path to the private editor', () => {
    expect(routes).toContainEqual({
      path: 'admin/education/:id/edit',
      component: AdminEducationEditorPage,
    });
  });
});

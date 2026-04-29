import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { searchPlugin } from "@react-pdf-viewer/search";

export const usePdfPlugins = () => {
  const pageNav = pageNavigationPlugin();
  const zoom = zoomPlugin();
  const thumbnail = thumbnailPlugin();
  const search = searchPlugin();

  return {
    plugins: [pageNav, zoom, thumbnail, search],

    pageNav: {
      jumpToNextPage: pageNav.jumpToNextPage,
      jumpToPreviousPage: pageNav.jumpToPreviousPage,
      jumpToPage: pageNav.jumpToPage,
    },

    zoom: {
      zoomTo: zoom.zoomTo,
    },

    thumbnail: {
      Thumbnails: thumbnail.Thumbnails,
    },

    search: {
      activateTab: search.activateTab,
    },
  };
};

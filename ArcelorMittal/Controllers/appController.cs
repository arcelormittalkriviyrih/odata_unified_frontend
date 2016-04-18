using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ArcelorMittal.Controllers
{
    public class appController : Controller
    {
        // GET: singlePage
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Market()
        {
            return View();
        }

        public ActionResult Marker()
        {
            return View();
        }

        public ActionResult PA()
        {
            return View();
        }

        public ActionResult WorkshopSpecs()
        {
            return View();
        }
    }
}
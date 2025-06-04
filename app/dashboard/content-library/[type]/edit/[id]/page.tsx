"use client";
import { useParams } from "next/navigation";
import EditAnnouncementForm from "../../../create/[type]/forms/EditAnnouncementForm";
import EditImageForm from "../../../create/[type]/forms/EditImageForm";
import EditPreDesignedForm from "../../../create/[type]/forms/EditPreDesignedForm";
import EditWebsiteForm from "../../../create/[type]/forms/EditWebsiteForm";
import EditGoogleCalendarForm from "../../../create/[type]/forms/EditGoogleCalendarForm";
import EditRamadanCountdownForm from "../../../create/[type]/forms/EditRamadanCountdownForm";
import EditDailyVerseForm from "../../../create/[type]/forms/EditDailyVerseForm";
import EditDailyHadithForm from "../../../create/[type]/forms/EditDailyHadithForm";
import EditDailyDuaForm from "../../../create/[type]/forms/EditDailyDuaForm";
import EditEidCountdownForm from "../../../create/[type]/forms/EditEidCountdownForm";
import EditDaysCountdownForm from "../../../create/[type]/forms/EditDaysCountdownForm";
import EditTaraweehTimingsForm from "../../../create/[type]/forms/EditTaraweehTimingsForm";

export default function EditContentPage() {
  const { type, id } = useParams();
  if (!type || !id) {
    return <div className="p-8 text-center text-red-600">Invalid content type or id</div>;
  }

  switch (type) {
    case "announcement":
      return <EditAnnouncementForm id={id as string} />;
    case "image":
      return <EditImageForm id={id as string} />;
    case "predesigned":
      return <EditPreDesignedForm id={id as string} />;
    case "website":
      return <EditWebsiteForm id={id as string} />;
    case "google_calendar":
      return <EditGoogleCalendarForm id={id as string} />;
    case "daily_verse":
      return <EditDailyVerseForm id={id as string} />;
    case "daily_hadith":
      return <EditDailyHadithForm id={id as string} />;
    case "daily_dua":
      return <EditDailyDuaForm id={id as string} />;
    case "ramadan_countdown":
      return <EditRamadanCountdownForm id={id as string} />;
    case "eid_countdown":
      return <EditEidCountdownForm id={id as string} />;
    case "days_countdown":
      return <EditDaysCountdownForm id={id as string} />;
    case "taraweeh_timings":
      return <EditTaraweehTimingsForm contentId={id as string} />;
    default:
      return <div className="p-8 text-center text-red-600">Invalid content type</div>;
  }
} 
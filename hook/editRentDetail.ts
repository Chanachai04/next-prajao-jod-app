"use client";
import React from "react";
import { districts, provinces, subDistricts } from "@/lib/thaiData";

type SubmitStatus =
  | { type: "success" | "error"; message: string }
  | null;

type ScheduleItem = {
  day: string;
  selected: boolean;
  allDay: boolean;
  open_time: string;
  close_time: string;
};

export default function useEditRentDetail(rentId: string | null) {
  const [images, setImages] = React.useState<File[]>([]);
  const [existingImages, setExistingImages] = React.useState<
    Array<{ id: string; image_url: string }>
  >([]);
  const [originalExistingImages, setOriginalExistingImages] = React.useState<
    Array<{ id: string; image_url: string }>
  >([]);
  const [submitStatus, setSubmitStatus] = React.useState<SubmitStatus>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"success" | "error">(
    "success"
  );
  const [modalTitle, setModalTitle] = React.useState<string | undefined>(
    undefined
  );
  const [modalDescription, setModalDescription] = React.useState<
    string | undefined
  >(undefined);

  const [formValues, setFormValues] = React.useState({
    name: "",
    type: "",
    description: "",
    total_slot: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    landmark: "",
    price_per_hour: "",
    price_per_day: "",
    price_per_month: "",
    deposit: "",
    owner_id: "",
  });

  // Read owner id from cookie or API
  React.useEffect(() => {
    const fetchUserId = async () => {
      if (typeof document === "undefined") return;

      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];

      if (cookieValue) {
        setFormValues((prev) => ({ ...prev, owner_id: cookieValue }));
        return;
      }

      try {
        const response = await fetch("/api/me");
        const data = await response.json();
        if (data.userId) {
          setFormValues((prev) => ({ ...prev, owner_id: data.userId }));
        }
      } catch (err) {
        console.error("Failed to fetch userId:", err);
      }
    };

    fetchUserId();
  }, []);

  // Load data from API
  React.useEffect(() => {
    if (!rentId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/editrentdetail?rent_id=${rentId}`);

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }

        const result = await response.json();

        if (result.success && result.data) {
          const { rentDetail, price, facilities, schedules, images } =
            result.data;

          // Set form values
          setFormValues({
            name: rentDetail.name || "",
            type: rentDetail.type || "",
            description: rentDetail.description || "",
            total_slot: String(rentDetail.total_slot || ""),
            address: rentDetail.address || "",
            subdistrict: rentDetail.subdistrict || "",
            district: rentDetail.district || "",
            province: rentDetail.province || "",
            landmark: rentDetail.landmark || "",
            price_per_hour: price?.price_per_hour
              ? String(price.price_per_hour)
              : "",
            price_per_day: price?.price_per_day
              ? String(price.price_per_day)
              : "",
            price_per_month: price?.price_per_month
              ? String(price.price_per_month)
              : "",
            deposit: price?.deposit ? String(price.deposit) : "",
            owner_id: rentDetail.owner_id || "",
          });

          // Set facilities
          if (facilities && facilities.length > 0) {
            setSelectedFacilities(
              facilities.map((f: { name: string }) => f.name)
            );
          }

          // Set schedules
          const dayLabels = [
            "วันจันทร์",
            "วันอังคาร",
            "วันพุธ",
            "วันพฤหัสบดี",
            "วันศุกร์",
            "วันเสาร์",
            "วันอาทิตย์",
          ];

          const newSchedules: ScheduleItem[] = dayLabels.map((day) => {
            const schedule = schedules?.find(
              (s: { available_days?: string[] }) =>
                s.available_days?.includes(day)
            );
            if (schedule) {
              const openTime = schedule.open_time?.slice(0, 5) || "06:00";
              const closeTime = schedule.close_time?.slice(0, 5) || "20:00";
              const isAllDay = openTime === "00:00" && closeTime === "00:00";
              return {
                day,
                selected: true,
                allDay: isAllDay,
                open_time: isAllDay ? "06:00" : openTime,
                close_time: isAllDay ? "20:00" : closeTime,
              };
            }
            return {
              day,
              selected: false,
              allDay: false,
              open_time: "06:00",
              close_time: "20:00",
            };
          });
          setSchedules(newSchedules);

          // Set existing images
          if (images && images.length > 0) {
            setExistingImages(images);
            setOriginalExistingImages(images);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setSubmitStatus({
          type: "error",
          message:
            err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลได้",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [rentId]);

  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>(
    []
  );
  const [agreeTerms, setAgreeTerms] = React.useState(true); // Default true for edit
  const [agreeFee, setAgreeFee] = React.useState(true); // Default true for edit

  const parkingTypes = React.useMemo(
    () => [
      "ที่จอดรถในบ้าน",
      "ที่จอดรถในคอนโด",
      "ที่จอดรถในห้าง",
      "ที่จอดรถสำนักงาน",
      "อื่นๆ",
    ],
    []
  );

  const dayLabels = React.useMemo(
    () => [
      "วันจันทร์",
      "วันอังคาร",
      "วันพุธ",
      "วันพฤหัสบดี",
      "วันศุกร์",
      "วันเสาร์",
      "วันอาทิตย์",
    ],
    []
  );

  const timeOptions = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`),
    []
  );

  const [schedules, setSchedules] = React.useState<ScheduleItem[]>(
    dayLabels.map((day) => ({
      day,
      selected: false,
      allDay: false,
      open_time: "06:00",
      close_time: "20:00",
    }))
  );

  const facilityOptions = React.useMemo(
    () => [
      "มีประตูเปิดปิด",
      "มีระบบรักษาความปลอดภัย",
      "มีหลังคา",
      "มีเจ้าหน้าที่ดูแล",
      "จอดค้างคืน",
      "มีบริการรับรถ",
      "กล้องวงจรปิด",
      "ห้องน้ำ",
    ],
    []
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const updated = [...images, ...files].slice(0, 10);
    setImages(updated);
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFieldChange =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const toggleFacility = (facility: string, checked: boolean) => {
    setSelectedFacilities((prev) => {
      if (checked) {
        if (prev.includes(facility)) return prev;
        return [...prev, facility];
      }
      return prev.filter((item) => item !== facility);
    });
  };

  const toggleSelectAllDays = (checked: boolean) => {
    setSchedules((prev) => prev.map((s) => ({ ...s, selected: checked })));
  };

  const toggleDay = (index: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, selected: checked, allDay: checked ? s.allDay : false }
          : s
      )
    );
  };

  const changeTime = (
    index: number,
    field: "open_time" | "close_time",
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const toggleAllDay = (index: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              allDay: checked,
              selected: checked ? true : s.selected,
              open_time: checked ? "00:00" : s.open_time,
              close_time: checked ? "00:00" : s.close_time,
            }
          : s
      )
    );
  };

  const handleProvinceSearchChange = (
    pId: number | null,
    dId: number | null,
    sId: number | null
  ) => {
    if (sId) {
      const sub = subDistricts.find((s) => s.id === sId);
      setFormValues((prev) => ({
        ...prev,
        subdistrict: sub?.name_th || prev.subdistrict,
      }));
    } else if (dId) {
      const district = districts.find((d) => d.id === dId);
      setFormValues((prev) => ({
        ...prev,
        district: district?.name_th || prev.district,
      }));
    } else if (pId) {
      const province = provinces.find((p) => p.id === pId);
      setFormValues((prev) => ({
        ...prev,
        province: province?.name_th || prev.province,
      }));
    }
  };

  const toNumberOrNull = (value: string, field: string) => {
    if (!value.trim()) return null;
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`กรุณากรอก${field}เป็นตัวเลข`);
    }
    return num;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);

    if (!rentId) {
      setSubmitStatus({
        type: "error",
        message: "ไม่พบ rent_id",
      });
      return;
    }

    if (!formValues.name.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกชื่อที่จอดรถ" });
      return;
    }
    if (!formValues.type) {
      setSubmitStatus({ type: "error", message: "กรุณาเลือกประเภทที่จอด" });
      return;
    }
    if (!formValues.total_slot.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจำนวนที่จอด" });
      return;
    }
    if (Number.isNaN(Number(formValues.total_slot))) {
      setSubmitStatus({ type: "error", message: "จำนวนที่จอดต้องเป็นตัวเลข" });
      return;
    }

    if (!formValues.address.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกที่อยู่" });
      return;
    }
    if (!formValues.province.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจังหวัด" });
      return;
    }
    if (!formValues.district.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกเขต/อำเภอ" });
      return;
    }
    if (!formValues.subdistrict.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกแขวง/ตำบล" });
      return;
    }
    if (!formValues.landmark.trim()) {
      setSubmitStatus({ type: "error", message: "กรุณากรอกจุดสังเกต" });
      return;
    }

    let pricePayload: {
      price_per_hour: number | null;
      price_per_day: number | null;
      price_per_month: number | null;
      deposit: number | null;
    };

    try {
      pricePayload = {
        price_per_hour: toNumberOrNull(formValues.price_per_hour, "ราคาต่อชั่วโมง"),
        price_per_day: toNumberOrNull(formValues.price_per_day, "ราคาต่อวัน"),
        price_per_month: toNumberOrNull(
          formValues.price_per_month,
          "ราคาต่อเดือน"
        ),
        deposit: toNumberOrNull(
          formValues.deposit,
          "ค่าประกันบัตร อุปกรณ์เข้าจอด และสติ๊กเกอร์"
        ),
      };
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "ข้อมูลราคาไม่ถูกต้อง",
      });
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      type: formValues.type,
      description: formValues.description.trim(),
      total_slot: Number(formValues.total_slot) || 0,
      address: formValues.address.trim(),
      subdistrict: formValues.subdistrict.trim(),
      district: formValues.district.trim(),
      province: formValues.province.trim(),
      landmark: formValues.landmark.trim(),
      price: pricePayload,
      facilities: selectedFacilities,
      schedule: schedules
        .filter((s) => s.selected)
        .map((s) => ({
          day: s.day,
          open_time: s.allDay ? "00:00" : s.open_time,
          close_time: s.allDay ? "00:00" : s.close_time,
        })),
    };

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      images.forEach((file) => formData.append("images", file, file.name));
      
      // หา image IDs ที่ถูกลบจริงๆ (เปรียบเทียบกับ original)
      const deletedImageIds = originalExistingImages
        .filter(
          (original) => !existingImages.some((current) => current.id === original.id)
        )
        .map((img) => img.id);
      
      formData.append("deleted_image_ids", JSON.stringify(deletedImageIds));

      const response = await fetch(
        `/api/editrentdetail?rent_id=${rentId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || "อัปเดตข้อมูลไม่สำเร็จ");
      }

      setSubmitStatus({ type: "success", message: "อัปเดตข้อมูลสำเร็จ" });
      setModalType("success");
      setModalTitle("อัปเดตข้อมูลสำเร็จ");
      setModalDescription("ข้อมูลถูกอัปเดตเรียบร้อยแล้ว");
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "อัปเดตข้อมูลไม่สำเร็จ";
      setSubmitStatus({ type: "error", message });
      setModalType("error");
      setModalTitle("เกิดข้อผิดพลาด");
      setModalDescription(message);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setModalOpen(false);

  return {
    images,
    existingImages,
    removeImage,
    removeExistingImage,
    handleImageChange,
    submitStatus,
    isSubmitting,
    isLoading,
    modalOpen,
    modalType,
    modalTitle,
    modalDescription,
    closeModal,
    formValues,
    setFormValues,
    parkingTypes,
    timeOptions,
    schedules,
    facilityOptions,
    selectedFacilities,
    agreeTerms,
    setAgreeTerms,
    agreeFee,
    setAgreeFee,
    handleFieldChange,
    toggleFacility,
    toggleSelectAllDays,
    toggleDay,
    changeTime,
    toggleAllDay,
    handleProvinceSearchChange,
    handleSubmit,
  } as const;
}


"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { getAllStudents } from "@/actions/teacher/getAllStudents";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

type Student = {
  id: string;
  name: string;
  email: string;
  enrollments: {
    course: {
      id: string;
      title: string;
    };
  }[];
};

export default function StudentsPageClient() {
  const t = useTranslations("students");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  
  useEffect(() => {
      const fetchStudents = async () => {
          const students = await getAllStudents();
          setStudents(students);
      }

      fetchStudents();
  },[])
  
  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {t("title")}
      </h1>

      {/* Search */}
      <Input
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("courses")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.name}
                </TableCell>

                <TableCell>{student.email}</TableCell>

                {/* Enrolled Courses */}
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {student.enrollments.length > 0 ? (
                      student.enrollments.map((enroll: any) => (
                        <Badge key={enroll.course.id} variant="secondary">
                          {enroll.course.title}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {t("noCourses")}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <Empty>
            <EmptyHeader>

            <EmptyTitle>{t("noStudents")}</EmptyTitle>
            <EmptyDescription>{t("noStudentsDescription")}</EmptyDescription>
            </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}